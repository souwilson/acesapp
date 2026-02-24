import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MFAFactor {
  id: string;
  friendly_name: string | null;
  factor_type: 'totp';
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

export function useMFA() {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const listFactors = async (): Promise<MFAFactor[]> => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error('Error listing MFA factors:', error);
      return [];
    }
    return data.totp as MFAFactor[];
  };

  const getVerifiedFactors = async (): Promise<MFAFactor[]> => {
    const factors = await listFactors();
    return factors.filter(f => f.status === 'verified');
  };

  const enrollMFA = async (friendlyName?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName || 'Autenticador TOTP',
      });

      if (error) {
        toast({
          title: 'Erro ao configurar MFA',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (code: string) => {
    if (!factorId) {
      toast({
        title: 'Erro',
        description: 'Fator MFA não encontrado. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        toast({
          title: 'Erro ao criar desafio MFA',
          description: challengeError.message,
          variant: 'destructive',
        });
        return false;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast({
          title: 'Código inválido',
          description: 'O código informado não é válido. Verifique e tente novamente.',
          variant: 'destructive',
        });
        return false;
      }

      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      
      toast({
        title: 'MFA ativado',
        description: 'Autenticação multifator configurada com sucesso!',
      });
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const challengeAndVerify = async (code: string, factorIdToVerify: string) => {
    setIsLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorIdToVerify,
      });

      if (challengeError) {
        toast({
          title: 'Erro ao criar desafio MFA',
          description: challengeError.message,
          variant: 'destructive',
        });
        return false;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorIdToVerify,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        toast({
          title: 'Código inválido',
          description: 'O código informado não é válido.',
          variant: 'destructive',
        });
        return false;
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const unenrollMFA = async (factorIdToRemove: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorIdToRemove,
      });

      if (error) {
        toast({
          title: 'Erro ao remover MFA',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'MFA removido',
        description: 'Autenticação multifator foi desativada.',
      });
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const getAssuranceLevel = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return null;
    return data;
  };

  const cancelEnrollment = () => {
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
  };

  return {
    isLoading,
    qrCode,
    secret,
    factorId,
    enrollMFA,
    verifyMFA,
    challengeAndVerify,
    unenrollMFA,
    listFactors,
    getVerifiedFactors,
    getAssuranceLevel,
    cancelEnrollment,
  };
}
