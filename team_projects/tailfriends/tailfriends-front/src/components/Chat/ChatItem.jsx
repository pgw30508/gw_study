import React from "react";
import { Box, Typography, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";

const parseLastMessage = (msg) => {
    try {
        const parsed = JSON.parse(msg);

        // 문자열 또는 숫자 등 원시 타입이 올 경우 그대로 반환
        if (typeof parsed === "string" || typeof parsed === "number") {
            return String(parsed);
        }

        // 객체 타입인 경우 커스텀 타입 분기 처리
        const type = parsed.customType;
        const content = parsed.content;

        if (typeof content === "string" || typeof content === "number") return String(content);
        if (type === "PETSITTER" && content?.sitterName) return `[펫시터] ${content.sitterName}`;
        if ((type === "MATCH" || type === "TRADE") && content?.text) return content.text;

        return String(content); // content가 객체 등일 경우 stringify or fallback
    } catch (e) {
        return String(msg); // 파싱 실패 시 문자열로 변환해서 반환
    }
};

const ChatItem = ({ photo, name, lastMessage, roomId, unreadCount }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/chat/room/${roomId}`);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={1}
            mb={1}
            onClick={handleClick}
            sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
        >
            <Box display="flex" alignItems="center">
                <img src={photo} alt={name} style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 12 }} />
                <Box display="flex" flexDirection="column">
                    <Typography fontWeight="bold">{name}</Typography>
                    <Typography color="textSecondary">{parseLastMessage(lastMessage)}</Typography>
                </Box>
            </Box>

            {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { right: 0, top: 0 } }} />
            )}
        </Box>
    );
};

export default ChatItem;
