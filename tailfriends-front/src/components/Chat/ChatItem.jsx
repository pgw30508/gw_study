import React from "react";
import { Box, Typography, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";

const parseLastMessage = (msg) => {
    try {
        const parsed = JSON.parse(msg);

        const type = parsed.customType;
        const content = parsed.content;

        if (typeof content === "string") return content;
        if (type === "PETSITTER" && content?.sitterName) return `[펫시터] ${content.sitterName}`;
        if ((type === "MATCH" || type === "TRADE") && content?.text) return content.text;

        return "알 수 없는 메시지";
    } catch (e) {
        return msg;
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
