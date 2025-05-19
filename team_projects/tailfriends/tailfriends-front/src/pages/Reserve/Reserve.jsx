import React, { useEffect } from "react";
import CategoryFilter from "../../components/Reserve/filter/CategoryFilter.jsx";
import SortFilter from "../../components/Reserve/filter/SortFilter";
import ListContent from "../../components/Reserve/content/ListContent.jsx";
import { Box, Button, Container, Divider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useNavigate } from "react-router-dom";
import { useReserveContext } from "../../context/ReserveContext.jsx";

const ReserveContent = () => {
    const navigate = useNavigate();
    const { setData, setNoData, setPage, setLast } = useReserveContext();

    useEffect(() => {
        setData([]);
        setNoData(false);
        setPage(0);
        setLast(false);
    }, []);

    return (
        <Container sx={{ maxWidth: 500 }}>
            <Box
                sx={{
                    maxWidth: 500,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                    position: "fixed",
                    top: 122,
                    left: "50%",
                    transform: "translate(calc(-50%), -50%)", // 가운데 정렬 후 왼쪽으로 5px 더 이동
                    background: "white",
                    zIndex: 10,
                }}
            >
                <CategoryFilter />
                <Box
                    my={2}
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        pl: 2,
                        pr: 2,
                        mb: 0,
                    }}
                >
                    <SortFilter />
                    <Button sx={{ bgcolor: "#FFF", borderRadius: 2 }} onClick={() => navigate("/payment")}>
                        내 예약 목록
                    </Button>
                </Box>
                <Divider />
            </Box>
            <ListContent />
        </Container>
    );
};

const Reserve = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ReserveContent />
    </LocalizationProvider>
);

export default Reserve;
