import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import Button from '../src/components/Button';
import Field from '../src/components/Field';
import { useSession } from '../src/session/context';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; password: string };

export default function Login() {
  const { signIn } = useSession();

  const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const submit = async ({ email, password }: LoginForm) => {
    try {
      await signIn(email, password);
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Cabecera con bloque de color: aquí luego puedes meter la imagen real de la mascota */}
      <View className="h-64 items-center justify-center rounded-b-[40px] bg-emerald-500">
        <View className="h-20 w-20 rounded-full bg-white/20" />
        <Text className="mt-4 text-2xl font-bold text-white">Iniciar sesión</Text>
        <Text className="text-emerald-50">Entra con tu cuenta institucional</Text>
      </View>

      {/* Tarjeta del formulario, superpuesta sobre la cabecera */}
      <View className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pt-8">
        <View className="gap-5">
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
            rules={{ required: 'La contraseña es obligatoria' }}
          />

          {!!formState.errors.root && (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          )}

          <Button
            text={formState.isSubmitting ? 'Entrando…' : 'Entrar'}
            onPress={handleSubmit(submit)}
            disabled={formState.isSubmitting}
          />

          <Link href="/register" className="text-center font-medium text-emerald-600">
            ¿No tienes cuenta? <Text className="underline">Regístrate</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}