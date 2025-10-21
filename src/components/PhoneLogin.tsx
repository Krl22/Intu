import React, { useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { auth } from '../lib/firebase';

type DialCode = '+51' | '+1';

const PhoneLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [dialCode, setDialCode] = useState<DialCode>('+51');

  const getAuthErrorMessage = (err: unknown) => {
    const code = (err as FirebaseError | { code?: string }).code;
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'El inicio con teléfono está deshabilitado. Actívalo en Firebase > Authentication > Sign-in method > Phone.';
      case 'auth/billing-not-enabled':
        return 'La facturación no está habilitada en tu proyecto. Para enviar SMS a números reales, activa el plan Blaze o usa números de prueba en Authentication > Phone > Test numbers.';
      case 'auth/invalid-phone-number':
        return 'Número inválido. Usa formato E.164: +1 555 555 1234 o +51 9XX XXX XXX.';
      case 'auth/app-not-authorized':
        return 'Dominio no autorizado. Agrega tu dominio en Authentication > Settings > Authorized domains.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
      case 'auth/network-request-failed':
        return 'Fallo de red. Verifica tu conexión.';
      case 'auth/quota-exceeded':
        return 'Se excedió el envío de SMS. Usa números de prueba en Authentication > Phone > Test numbers.';
      case 'auth/captcha-check-failed':
        return 'No pudimos verificar el reCAPTCHA. Refresca e intenta nuevamente.';
      default:
        return 'Error al enviar/verificar el código. Revisa tu número y vuelve a intentar.';
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expirado. Por favor, inténtalo de nuevo.');
        }
      });
    }
  };

  const toggleDial = () => {
    setDialCode((prev) => (prev === '+51' ? '+1' : '+51'));
    setPhoneNumber('');
    setError('');
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Por favor, ingresa tu número de teléfono');
      return;
    }

    // E.164: +<country><national_number>
    const nationalDigits = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    const e164Phone = `${dialCode}${nationalDigits}`;

    setLoading(true);
    setError('');

    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        e164Phone,
        window.recaptchaVerifier as RecaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setStep('verification');
    } catch (error: unknown) {
      console.error('Error sending SMS:', error);
      setError(getAuthErrorMessage(error));
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier?.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Por favor, ingresa el código de verificación');
      return;
    }

    if (!confirmationResult) {
      setError('Error en la verificación. Por favor, solicita un nuevo código.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmationResult.confirm(verificationCode);
      // El usuario será redirigido automáticamente por el AuthContext
    } catch (error: unknown) {
      console.error('Error verifying code:', error);
      setError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setVerificationCode('');
    setError('');
    setConfirmationResult(null);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (dialCode === '+51') {
      // Perú: 9 dígitos -> 3 3 3
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
    } else {
      // USA: 10 dígitos -> 3 3 4
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)}`;
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`;
    }
  };

  const inputMaxLength = dialCode === '+51' ? 11 : 12; // espacios incluidos

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {step === 'verification' && (
          <button
            onClick={handleBack}
            className="text-white p-2"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {step === 'phone' ? (
          <>
            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">
                Ingresa tu número
              </h1>
              <p className="text-gray-400 text-lg">
                Te enviaremos un código de verificación
              </p>
            </div>

            {/* Selector de país */}
            <div className="mb-2 flex space-x-2">
              <button
                type="button"
                onClick={() => { setDialCode('+51'); setPhoneNumber(''); }}
                className={`px-3 py-2 rounded-lg text-sm border ${dialCode === '+51' ? 'bg-white text-black border-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
              >
                🇵🇪 +51
              </button>
              <button
                type="button"
                onClick={() => { setDialCode('+1'); setPhoneNumber(''); }}
                className={`px-3 py-2 rounded-lg text-sm border ${dialCode === '+1' ? 'bg-white text-black border-white' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
              >
                🇺🇸 +1
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center bg-gray-900 rounded-lg p-4 border border-gray-700 focus-within:border-white">
                <button
                  type="button"
                  onClick={toggleDial}
                  className="text-white text-lg mr-3 hover:text-blue-300"
                >
                  {dialCode === '+51' ? '🇵🇪 +51' : '🇺🇸 +1'}
                </button>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={dialCode === '+51' ? '9XX XXX XXX' : 'XXX XXX XXXX'}
                  className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 outline-none"
                  maxLength={inputMaxLength}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-white text-black font-semibold py-4 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Continuar'}
            </button>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">
                Ingresa el código
              </h1>
              <p className="text-gray-400 text-lg">
                Enviamos un código a {dialCode} {phoneNumber}
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Código de 6 dígitos"
                className="w-full bg-gray-900 text-white text-center text-2xl py-4 rounded-lg border border-gray-700 focus:border-white outline-none tracking-widest"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-white text-black font-semibold py-4 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>

            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full mt-4 text-gray-400 py-2 text-lg disabled:opacity-50"
            >
              Cambiar número
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-6">
        <p className="text-gray-500 text-sm text-center">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

// Declaración global para TypeScript
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default PhoneLogin;