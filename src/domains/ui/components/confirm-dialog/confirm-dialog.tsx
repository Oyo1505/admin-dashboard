'use client';
import { Button } from '@/domains/ui/components/button/button';
import * as Dialog from '@radix-ui/react-dialog';

interface IConfirmDialog {
  /** Visible text of the trigger button */
  triggerLabel: string;
  /** Accessible name of the trigger; must start with triggerLabel (WCAG 2.5.3) */
  triggerAriaLabel?: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Destructive action guarded by a confirmation (role="alertdialog").
 * Focus is trapped and restored to the trigger by Radix Dialog.
 */
const ConfirmDialog = ({
  triggerLabel,
  triggerAriaLabel,
  title,
  description,
  confirmLabel,
  cancelLabel,
  disabled,
  onConfirm,
}: IConfirmDialog) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <Button
        type="button"
        variant="destructive"
        className="font-bold hover:cursor-pointer"
        aria-label={triggerAriaLabel}
        disabled={disabled}
      >
        {triggerLabel}
      </Button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-background opacity-60 data-[state=open]:animate-overlayShow" />
      <Dialog.Content
        role="alertdialog"
        className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-112.5 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 text-background shadow-lg focus-visible:outline-hidden data-[state=open]:animate-contentShow"
      >
        <Dialog.Title className="m-0 text-lg font-bold">{title}</Dialog.Title>
        <Dialog.Description className="mt-2.5 mb-5 text-[15px] leading-normal">
          {description}
        </Dialog.Description>
        <div className="flex justify-end gap-3">
          <Dialog.Close asChild>
            <Button
              type="button"
              variant="outline"
              className="border-gray-500 bg-white text-background hover:bg-gray-100 hover:text-background"
            >
              {cancelLabel}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export default ConfirmDialog;
