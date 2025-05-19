import { createTheme } from "@mui/material/styles";

// 커스텀 색상 설정
const theme = createTheme({
    brand1: "#FFF7EF",
    brand2: "#F2DFCE",
    brand3: "#E9A260",
    brand4: "#363636",
    brand5: "#FDF1E5",
    secondary: "#9A9090",

    components: {
        MuiModal: {
            defaultProps: {
                disableScrollLock: true,
            },
        },
        MuiDialog: {
            defaultProps: {
                disableScrollLock: true,
            },
        },
    },
});

export default theme;
