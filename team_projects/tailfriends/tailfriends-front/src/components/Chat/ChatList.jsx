import React, { useContext, useEffect, useState } from "react";
import ProfileHeader from "../PetSta/Post/ProfileHeader.jsx";
import { Context } from "../../context/Context.jsx";
import { Box, CircularProgress, Typography } from "@mui/material";
import SearchIcon from "../../assets/images/Chat/search-icon.svg";
import ChatItem from "./ChatItem.jsx";
import { getMyChatRooms } from "../../services/chatService.js";
import { sendChatNotification } from "../../services/notificationService.js";

const ChatList = () => {
    const { user, nc, isChatOpen, isChatRoomOpen, chatList, setChatList } = useContext(Context);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // 메시지 content 파싱 유틸
    const parseMessage = (msg) => {
        console.log("[parseMessage] raw msg.content:", msg.content); // 디버깅 추가
        let parsed;
        try {
            parsed = JSON.parse(msg.content);
            if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                parsed = { customType: "TEXT", content: String(msg.content) };
            }
        } catch (e) {
            console.warn("[parseMessage] JSON.parse 실패:", e);
            parsed = { customType: "TEXT", content: String(msg.content) };
        }

        let typeId = 1;
        if (parsed.customType === "MATCH") typeId = 2;
        else if (parsed.customType === "TRADE") typeId = 3;
        else if (parsed.customType === "PETSITTER") typeId = 4;

        return {
            id: msg.message_id,
            senderId: msg.sender?.id,
            text: parsed.content,
            type_id: typeId,
            metadata: parsed,
            photo: msg.sender?.profile,
            parsed,
        };
    };

    useEffect(() => {
        if (!user || !nc) return;

        // 채팅방 리스트 조회 및 초기화
        const fetchRooms = async () => {
            try {
                setIsLoading(true);
                const roomList = await getMyChatRooms();
                const result = [];

                for (let room of roomList) {
                    const filter = { name: room.uniqueId };
                    const channels = await nc.getChannels(filter, {}, { per_page: 1 });
                    const edge = (channels.edges || [])[0];
                    if (!edge) continue;

                    const ch = edge.node;
                    await nc.subscribe(ch.id);

                    console.log("[fetchRooms] 채널 last_message.content:", ch.last_message?.content); // 디버깅 추가

                    let lastMessageText = "";

                    try {
                        const raw = ch.last_message?.content;
                        let parsed;
                        if (typeof raw === "string") {
                            parsed = JSON.parse(raw);
                            console.log("[fetchRooms] 파싱된 last_message:", parsed); // 디버깅 추가

                            if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                                lastMessageText = String(raw);
                            } else {
                                const customType = parsed.customType;
                                const content = parsed.content;

                                if (typeof content === "string") {
                                    lastMessageText = content;
                                } else if (customType === "PETSITTER" && content?.sitterName) {
                                    lastMessageText = `[펫시터] ${content.sitterName}`;
                                } else if ((customType === "MATCH" || customType === "TRADE") && content?.text) {
                                    lastMessageText = content.text;
                                } else {
                                    lastMessageText = content;
                                }
                            }
                        } else {
                            lastMessageText = "메시지 없음";
                        }
                    } catch (err) {
                        console.error("[fetchRooms] last_message 파싱 실패:", err);
                        lastMessageText = "메시지를 불러올 수 없음";
                    }

                    let unreadCount = 0;
                    try {
                        const unreadResult = await nc.unreadCount(ch.id);
                        unreadCount = unreadResult.unread || 0;
                    } catch (err) {
                        console.warn(`[fetchRooms] 채널 ${ch.id} unreadCount 조회 실패`, err);
                    }

                    result.push({
                        id: ch.id,
                        name: room.nickname,
                        photo: room.profileUrl,
                        lastMessage: typeof lastMessageText === "string" ? lastMessageText : "메시지 오류",
                        lastMessageSentAt: ch.last_message?.sended_at || ch.updated_at,
                        unreadCount,
                    });
                }

                result.sort((a, b) => new Date(b.lastMessageSentAt) - new Date(a.lastMessageSentAt));
                setChatList(result);
            } catch (e) {
                console.error("[fetchRooms] 채팅방 정보 조회 실패:", e);
            } finally {
                setIsLoading(false);
            }
        };

        // 실시간 메시지 수신 핸들러
        const handleReceiveMessage = async (channel, msg) => {
            console.log("[handleReceiveMessage] 수신된 메시지:", msg); // 디버깅 추가
            const { parsed } = parseMessage(msg);
            const isMine = msg.sender.id === `ncid${user.id}`;
            if (isMine) return;

            const numericSenderId = msg.sender.id.replace(/\D/g, "");

            const payload = {
                userId: user.id,
                channelId: msg.channel_id,
                senderId: numericSenderId,
                message: parsed.content,
                type: parsed.customType,
                createdAt: new Date().toISOString(),
            };

            try {
                await sendChatNotification(payload);
            } catch (err) {
                console.error("[handleReceiveMessage] 알림 전송 실패:", err);
            }

            setChatList((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((item) => item.id === msg.channel_id);
                if (idx !== -1) {
                    let text = "";
                    try {
                        let parsed = JSON.parse(msg.content);
                        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                            text = String(msg.content);
                        } else if (typeof parsed.content === "string") {
                            text = parsed.content;
                        } else if (parsed.customType === "PETSITTER" && parsed.content?.sitterName) {
                            text = `[펫시터] ${parsed.content.sitterName}`;
                        } else if (
                            (parsed.customType === "MATCH" || parsed.customType === "TRADE") &&
                            parsed.content?.text
                        ) {
                            text = parsed.content.text;
                        } else {
                            text = String(msg.content);
                        }
                    } catch (e) {
                        console.warn("[handleReceiveMessage] 메시지 파싱 실패:", e);
                        text = String(msg.content);
                    }

                    updated[idx] = {
                        ...updated[idx],
                        lastMessage: text,
                        lastMessageSentAt: msg.sended_at,
                        unreadCount: isMine ? 0 : updated[idx].unreadCount + 1,
                    };

                    updated.sort((a, b) => new Date(b.lastMessageSentAt) - new Date(a.lastMessageSentAt));
                }
                console.log("[handleReceiveMessage] updated chatList:", updated); // 디버깅 추가
                return updated;
            });
        };

        fetchRooms();
        if (isChatOpen && !isChatRoomOpen) {
            nc.bind("onMessageReceived", handleReceiveMessage);
        }

        return () => {
            nc.unbind("onMessageReceived", handleReceiveMessage);
        };
    }, [user, nc, isChatOpen, isChatRoomOpen]);

    const filteredChatList = chatList.filter((item) => {
        const keyword = search.toLowerCase();
        return item.name.toLowerCase().includes(keyword) || item.lastMessage.toLowerCase().includes(keyword);
    });

    return (
        <Box p={1}>
            <ProfileHeader userName={user.name} />

            <Box bgcolor="#d9d9d9" p={1.5} borderRadius="15px" display="flex" alignItems="center">
                <img src={SearchIcon} alt="search" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="채팅방 검색"
                    style={{
                        marginLeft: "10px",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                        fontSize: "16px",
                        flex: 1,
                    }}
                />
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress size={32} />
                </Box>
            ) : filteredChatList.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" mt={4}>
                    아직 채팅방이 없습니다.
                </Typography>
            ) : (
                filteredChatList.map((item) => (
                    <ChatItem
                        key={item.id}
                        name={item.name}
                        photo={item.photo}
                        lastMessage={item.lastMessage}
                        roomId={item.id}
                        unreadCount={item.unreadCount}
                    />
                ))
            )}
        </Box>
    );
};

export default ChatList;
