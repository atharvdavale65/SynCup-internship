import styled from "@mui/system/styled"
import HdrAutoOutlinedIcon from "@mui/icons-material/HdrAutoOutlined"
import AccessTimeTwoToneIcon from "@mui/icons-material/AccessTimeTwoTone"
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"

export const CustomIcon = styled(HdrAutoOutlinedIcon)({
  backgroundColor: "yellow",
  borderRadius: 50,
  marginRight: "3px",
})

export const Overdue = styled(AccessTimeTwoToneIcon)({
  backgroundColor: "#f06a69",
  borderRadius: 50,
  color: "white",
  marginRight: "3px",
})

export const Duedate = styled(AccessTimeTwoToneIcon)({
  backgroundColor: "yellow",
  borderRadius: 50,
  color: "white",
  marginRight: "3px",
})

export const Personal = styled(AccessTimeTwoToneIcon)({
  marginRight: "3px",
})

export const PersonalLabel = styled(LabelOutlinedIcon)({
  marginRight: "3px",
  transform: "rotate(140deg)",
})

export const Calendar = styled(CalendarMonthIcon)({
  marginRight: "3px",
})

export const inputStyles = {
  backgroundColor: "#369ae6",
  color: "white",
  borderRadius: "4px",
  fontWeight: 500,
  "& .MuiInputLabel-root": {
    color: "white",
    fontSize: "20px",
  },
  "& .MuiInputBase-input": {
    color: "white",
    height: "5px",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "white",
  },
}
