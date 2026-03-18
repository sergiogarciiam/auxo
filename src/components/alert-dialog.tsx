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

export function CustomAlertDialog({ message, open, confirm, cancel }) {
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
