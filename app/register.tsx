import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import Button from '../src/components/Button';
import Field from '../src/components/Field';
import { useSession } from '../src/session/context';

type RegisterForm = { name: string; email: string; password: string; confirmation: string };

export default function Register() {
  const { signUp } = useSession();
  const { control, handleSubmit, setError, getValues, formState } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '', confirmation: '' },
  });

  const submit = async ({ name, email, password }: RegisterForm) => {
    try {
      await signUp(name, email, password);
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50" keyboardShouldPersistTaps="handled">
      {/* Cabecera con bloque de color, consistente con login y home */}
      <View className="h-40 items-center justify-center rounded-b-[40px] bg-emerald-500 px-6">
        <Text className="text-2xl font-bold text-white">Crear cuenta</Text>
        <Text className="text-center text-emerald-50">
          Se creará una cuenta de solicitante para reportar y seguir tus casos.
        </Text>
      </View>

      <View className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pt-8 pb-10">
        <View className="gap-5">
          <Field
            control={control}
            name="name"
            label="Nombre completo"
            autoCapitalize="words"
            placeholder="Ana María Restrepo"
            rules={{
              required: 'El nombre es obligatorio',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            }}
          />
          <Field
            control={control}
            name="email"
            label="Correo"
            keyboardType="email-address"
            placeholder="nombre@autonoma.edu.co"
            rules={{
              required: 'El correo es obligatorio',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            }}
          />
          <Field
            control={control}
            name="password"
            label="Contraseña"
            secureTextEntry
            placeholder="••••••••"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            }}
          />
          <Field
            control={control}
            name="confirmation"
            label="Confirmar contraseña"
            secureTextEntry
            placeholder="••••••••"
            rules={{
              required: 'Confirma la contraseña',
              validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
            }}
          />

          {!!formState.errors.root && (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          )}

          <Button
            text={formState.isSubmitting ? 'Creando…' : 'Crear cuenta'}
            onPress={handleSubmit(submit)}
            disabled={formState.isSubmitting}
          />

          <Link href="/login" className="text-center font-medium text-emerald-600">
            ¿Ya tienes cuenta? <Text className="underline">Inicia sesión</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}