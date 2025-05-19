import React from "react";
import { PaymentHistoryItem } from "./PaymentHistoryItem.jsx";
import { Box, Typography, CircularProgress, Container } from "@mui/material";

export const PaymentHistory = ({ payments, loading }) => {
    console.log(payments);
    if (loading) {
        return (
            <Box
                sx={{
                    padding: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <CircularProgress color="primary" />
                <Typography color="text.secondary">결제 내역을 불러오는 중...</Typography>
            </Box>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <Box
                sx={{
                    padding: 4,
                    textAlign: "center",
                    color: "text.secondary",
                }}
            >
                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                    결제 내역이 없습니다.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    조회 기간을 다르게 설정해 보세요.
                </Typography>
            </Box>
        );
    }

    return (
        <Container
            disableGutters
            sx={{
                paddingTop: "1px",
                bgcolor: "background.paper",
            }}
        >
            {payments.map((payment, index) => (
                <PaymentHistoryItem key={payment.id} payment={payment} isLast={index === payments.length - 1} />
            ))}
        </Container>
    );
};
