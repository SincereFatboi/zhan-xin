import { useSnackbar } from "notistack";

export const useNotify = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleNotify = (variant, message) => {
    enqueueSnackbar(<strong style={{ fontWeight: "500" }}>{message}</strong>, {
      variant, // success, error, warning, info, or default
      TransitionProps: { direction: "down" },
      anchorOrigin: {
        vertical: "top",
        horizontal: "center",
      },
      autoHideDuration: 3000,
      disableWindowBlurListener: true,
      style: {
        margin: "auto",
        textAlign: "justify",
      },
    });
  };

  return handleNotify;
};
