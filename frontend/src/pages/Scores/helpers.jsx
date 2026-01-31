import * as yup from "yup";

export const schema = yup.object().shape({
  roomName: yup
    .string()
    .required("required")
    .max(30, "must be less than 30 characters")
    .matches(
      /^[A-Za-z0-9_\-()]+$/,
      "can only contain letters, numbers, -, _, and ()",
    ),
});
