import React from "react";
import "../../css/App.css";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import BottomButton from "./BottomButton.jsx";
import board from "../../assets/images/Global/board.png";
import main from "../../assets/images/Global/main.svg";
import petsta from "../../assets/images/Global/petsta.png";
import reserve from "../../assets/images/Global/reserve.png";
import petsitter from "../../assets/images/Global/petsitter.png";

const Footer = () => {
    const navigate = useNavigate();

    return (
        <Box component="div" className="footer" display="flex" alignItems="end" justifyContent="space-between">
            <BottomButton icon={petsta} label="펫스타" onClick={() => navigate("/petsta")} />
            <BottomButton icon={board} label="게시판" onClick={() => navigate("/board")} />
            <Box component="div" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
                <img src={main} />
            </Box>
            <BottomButton icon={reserve} label="예약" onClick={() => navigate("/reserve")} />
            <BottomButton icon={petsitter} label="펫시터찾기" onClick={() => navigate("/petsitter-finder")} />
        </Box>
    );
};

export default Footer;
