import PackingDialog from "../components/PackingDialog";
import TextInput from "../components/TextInput";

const CancelReceiveShipmentDialog = ({
  onChange,
  onSubmit,
  open,
  onClose,
  reason,
  isError,
  canErrorCheck,
}) => {
  return (
    <PackingDialog
      open={open}
      titleText={"Reason for Canceling"}
      onClose={onClose}
      onBackdropClick={onClose}
      onSubmit={() => onSubmit()}
      submitDisabled={false}
      fullWidth={true}
      maxWidth="xs"
      children={
        <TextInput
          onChange={onChange}
          value={reason}
          error={isError}
          canErrorCheck={canErrorCheck}
          variant={"outlined"}
          multiline={4}
          fullWidth={true}
        />
      }
    />
  );
};

export default CancelReceiveShipmentDialog;
