import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

interface CustomAlertDialogProps {
  message: string;
  open: boolean;
  confirmText?: string;
  cancelText?: string;
  confirm: () => void;
  cancel: () => void;
}

export function CustomAlertDialog({
  message,
  open,
  confirmText,
  cancelText,
  confirm,
  cancel,
}: CustomAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={cancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row justify-end gap-3">
          <AlertDialogCancel onPress={cancel}>
            <Text>{cancelText || "Cancel"}</Text>
          </AlertDialogCancel>

          <AlertDialogAction onPress={confirm}>
            <Text>{confirmText || "Confirm"}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
