import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PasswordResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordResetDialog({ open, onOpenChange }: PasswordResetDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutate: resetPassword, isPending, error, isSuccess } = useMutation({
    mutationFn: () =>
      authApi.resetPassword({
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword.trim()) {
      return
    }

    if (!newPassword.trim()) {
      return
    }

    if (newPassword !== confirmPassword) {
      return
    }

    if (newPassword.length < 8) {
      return
    }

    resetPassword()
  }

  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 8 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword

  const passwordsMatch = newPassword === confirmPassword || confirmPassword === ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 px-6">
        <SheetHeader className="mt-4 mb-8">
          <SheetTitle className="text-xl">Cambiar Contraseña</SheetTitle>
          <SheetDescription className="mt-2">
            Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-8">
          {isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Contraseña actualizada exitosamente.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error instanceof Error ? error.message : 'Error al cambiar la contraseña'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-3">
              <label htmlFor="current-password" className="text-sm font-medium">
                Contraseña Actual
              </label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  disabled={isPending || isSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <label htmlFor="new-password" className="text-sm font-medium">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isPending || isSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {newPassword.length > 0 && newPassword.length < 8
                  ? `${8 - newPassword.length} caracteres más requeridos`
                  : newPassword.length >= 8
                    ? '✓ Contraseña válida'
                    : ''}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  disabled={isPending || isSuccess}
                  className={
                    !passwordsMatch && confirmPassword
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!passwordsMatch && confirmPassword && (
                <p className="text-xs text-red-500 mt-2">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || isSuccess}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!isFormValid || isPending || isSuccess}>
                {isPending ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

