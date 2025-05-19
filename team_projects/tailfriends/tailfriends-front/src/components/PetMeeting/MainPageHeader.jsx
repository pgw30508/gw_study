import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import chatLogo from "../../assets/images/Global/comment.svg";
import { Box, Typography } from "@mui/material";
import { Context } from "../../context/Context.jsx";

const MainPageHeader = () => {
    const navigate = useNavigate();
    const { pet } = useContext(Context);

    return (
        <Box
            sx={{
                padding: "15px 5px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                borderBottom: "1px solid #ccc",
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5">{pet?.name} 동네친구들</Typography>
                <Typography variant="caption">새로운 친구를 만나보아요</Typography>
            </Box>
        </Box>
    );
};

export default MainPageHeader;
