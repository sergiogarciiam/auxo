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
  confirm: () => void;
  cancel: () => void;
}

export function CustomAlertDialog({
  message,
  open,
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
            <Text>Cancel</Text>
          </AlertDialogCancel>

          <AlertDialogAction onPress={confirm}>
            <Text>Confirm</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
