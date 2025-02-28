import * as yup from "yup";

export const schema = yup.object().shape({
  firstName: yup.string().strict().required(),
  lastName: yup.string().strict().required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    .required()
    .min(8)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).*$/,
      "Must contain at least one uppercase, one lowercase, and one special character"
    ),
});
