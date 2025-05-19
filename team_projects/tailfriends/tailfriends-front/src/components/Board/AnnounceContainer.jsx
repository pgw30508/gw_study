import React from "react";
import { Box, Typography } from "@mui/material";
import Speaker from "../../assets/images/Board/speaker.svg";
import { useTheme } from "@mui/material/styles";
import AnnounceSlider from "./AnnounceSlider.jsx";

const AnnounceContainer = ({ announceData }) => {
    const theme = useTheme();
    return (
        <Box sx={{ px: 1.5 }}>
            <Box
                sx={{
                    display: "flex",
                    borderRadius: "10px",
                    borderColor: "#C8C8C8",
                    backgroundColor: theme.brand5,
                    width: "100%",
                    my: "10px",
                    alignItems: "center",
                    py: "6px",
                    px: "12px",
                }}
            >
                <Box component="img" src={Speaker} sx={{ mr: "5px" }}></Box>
                <Typography
                    sx={{
                        verticalAlign: "middle",
                    }}
                >
                    공지
                </Typography>
                <AnnounceSlider announceData={announceData} />
            </Box>
        </Box>
    );
};

export default AnnounceContainer;
