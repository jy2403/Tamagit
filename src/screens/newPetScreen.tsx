import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayBackground } from '@/components/clay/ClayBackground';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayIconButton } from '@/components/clay/ClayIconButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayPill } from '@/components/clay/ClayPill';
import { ClaySurface } from '@/components/clay/ClaySurface';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { apiFetch } from '@/lib/api';
import type { Branch, Pet, Project } from '@/lib/types';
import { clay, radios, sombras } from '@/estilos';

function ProjectRow({ project, onPress }: { project: Project; onPress: () => void }) {
  return (
    <View style={[{ marginBottom: 10 }, sombras.suave]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Elegir ${project.name}`}
        style={({ pressed }) => [{ borderRadius: radios.tarjeta }, pressed && { opacity: 0.86 }]}>
        <ClaySurface
          colors={clay.blanco}
          radius={radios.tarjeta}
          border
          contentStyle={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: '#F0F0F4',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>📦</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, fontWeight: '900', color: clay.texto }}>
                {project.name}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 10, color: clay.textoSuave }}>
                {project.fullName ?? 'Repositorio de GitHub'}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: clay.textoTenue }}>›</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {project.mainLanguage ? (
              <ClayPill
                label={project.mainLanguage}
                colors={clay.menta}
                textColor="#1A1A1C"
                accessibilityLabel={`Lenguaje: ${project.mainLanguage}`}
              />
            ) : null}
            {project.tools.slice(0, 3).map((tool) => (
              <ClayPill key={tool} label={tool} colors={clay.fondoClaro} textColor={clay.texto} />
            ))}
          </View>
        </ClaySurface>
      </Pressable>
    </View>
  );
}

export default function NewPetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { projects, loading, error: projectsError } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState<string | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(() => projects.filter((project) => !project.pet), [projects]);

  const chooseProject = useCallback(
    async (project: Project) => {
      const fullName = project.fullName;
      const fallback = project.defaultBranch ?? 'main';
      setSelected(project);
      setError(null);
      setBranches([]);
      setBranch(fallback);
      setLoadingBranches(true);

      if (!token || !fullName) {
        setBranches([fallback]);
        setLoadingBranches(false);
        return;
      }

      try {
        const data = await apiFetch<Branch[]>(`/github/repos/${fullName}/branches`, { token });
        const names = data.map((item) => item.name);
        setBranches(names.length > 0 ? names : [fallback]);
        setBranch(names[0] ?? fallback);
      } catch {
        setBranches([fallback]);
      } finally {
        setLoadingBranches(false);
      }
    },
    [token]
  );

  const create = useCallback(async () => {
    if (!selected || !token || creating) return;
    setCreating(true);
    setError(null);
    try {
      const pet = await apiFetch<Pet>(`/projects/${selected.id}/pet`, {
        token,
        method: 'POST',
        body: {
          name: name.trim() || undefined,
          lifeBranch: branch ?? selected.defaultBranch ?? undefined,
        },
      });
      router.replace({
        pathname: '/project/[id]',
        params: {
          id: String(selected.id),
          fullName: selected.fullName ?? '',
          name: pet.name,
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la mascota');
    } finally {
      setCreating(false);
    }
  }, [branch, creating, name, router, selected, token]);

  const header = (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <ClayIconButton
        icon="←"
        accessibilityLabel="Volver"
        onPress={() => router.back()}
        size={50}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 19, fontWeight: '900', color: clay.texto }}>Nueva mascota</Text>
        <Text style={{ fontSize: 10, color: clay.textoSuave }}>
          {selected ? 'Paso 2 de 2 · Nombre y rama' : 'Paso 1 de 2 · Elige un repositorio'}
        </Text>
      </View>
      <ClayPill
        label={selected ? '2/2' : '1/2'}
        colors={clay.negro}
        textColor="#FFFFFF"
        accessibilityLabel={selected ? 'Paso 2 de 2' : 'Paso 1 de 2'}
      />
    </View>
  );

  if (loading && projects.length === 0) {
    return (
      <ClayBackground>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={clay.violeta[0]} />
        </View>
      </ClayBackground>
    );
  }

  if (selected) {
    return (
      <ClayBackground>
        {header}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 28 }}
          keyboardShouldPersistTaps="handled">
          <View style={sombras.tarjeta}>
            <ClaySurface colors={clay.blanco} radius={radios.tarjetaGrande} border>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: clay.textoSuave }}>
                  REPOSITORIO
                </Text>
                <Text style={{ marginTop: 4, fontSize: 16, fontWeight: '900', color: clay.texto }}>
                  {selected.name}
                </Text>
                <Text style={{ fontSize: 10, color: clay.textoSuave }}>
                  {selected.fullName ?? 'GitHub'}
                </Text>
                <Pressable
                  onPress={() => {
                    setSelected(null);
                    setError(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Elegir otro repositorio"
                  style={{ alignSelf: 'flex-start', marginTop: 8, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: clay.violeta[1] }}>
                    Cambiar repositorio
                  </Text>
                </Pressable>
              </View>
            </ClaySurface>
          </View>

          <Text
            style={{
              marginTop: 18,
              marginBottom: 8,
              fontSize: 12,
              fontWeight: '900',
              color: clay.texto,
            }}>
            Nombre de la mascota
          </Text>
          <ClayInput
            value={name}
            onChangeText={setName}
            placeholder={selected.name}
            autoCapitalize="words"
            maxLength={30}
            accessibilityLabel="Nombre de la mascota"
          />

          <Text
            style={{
              marginTop: 18,
              marginBottom: 8,
              fontSize: 12,
              fontWeight: '900',
              color: clay.texto,
            }}>
            Rama de vida
          </Text>
          <Text style={{ marginBottom: 8, fontSize: 10, color: clay.textoSuave }}>
            Desde esta rama se calcula el daño por commits.
          </Text>
          {loadingBranches ? (
            <ActivityIndicator color={clay.violeta[0]} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {branches.map((item) => {
                const active = branch === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setBranch(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${item}${active ? ', seleccionada' : ''}`}
                    style={({ pressed }) => [
                      { minHeight: 48, justifyContent: 'center' },
                      pressed ? { opacity: 0.8 } : null,
                    ]}>
                    <ClaySurface
                      colors={active ? clay.violeta : clay.fondoClaro}
                      radius={radios.pastilla}
                      shadow={active ? 'suave' : false}
                      border
                      contentStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '900',
                          color: active ? '#FFFFFF' : clay.texto,
                        }}>
                        {active ? '✓ ' : ''}
                        {item}
                      </Text>
                    </ClaySurface>
                  </Pressable>
                );
              })}
            </View>
          )}

          {error ? (
            <Text style={{ marginTop: 12, fontSize: 11, color: '#B4221B' }}>{error}</Text>
          ) : null}

          <View style={{ marginTop: 24 }}>
            <ClayButton
              title={creating ? 'Creando…' : 'Crear mascota'}
              colors={clay.verde}
              textColor="#FFFFFF"
              disabled={creating}
              onPress={() => void create()}
              accessibilityLabel="Crear mascota"
            />
          </View>
        </ScrollView>
      </ClayBackground>
    );
  }

  return (
    <ClayBackground>
      {header}
      {projectsError ? (
        <Text style={{ paddingHorizontal: 16, paddingBottom: 6, fontSize: 11, color: '#B4221B' }}>
          {projectsError}
        </Text>
      ) : null}
      <FlatList
        data={available}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProjectRow project={item} onPress={() => void chooseProject(item)} />
        )}
        ListEmptyComponent={
          <View
            style={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40, gap: 10 }}>
            <Text style={{ fontSize: 34 }}>🗂️</Text>
            <Text
              style={{ textAlign: 'center', fontSize: 14, fontWeight: '900', color: clay.texto }}>
              {projects.length === 0
                ? 'Aún no hay proyectos sincronizados'
                : 'Todos tus proyectos ya tienen mascota'}
            </Text>
            <Text style={{ textAlign: 'center', fontSize: 11, color: clay.textoSuave }}>
              Sincroniza tus repositorios desde el menú lateral para empezar.
            </Text>
            <ClayButton
              title="Volver al inicio"
              colors={clay.violeta}
              onPress={() => router.back()}
              style={{ marginTop: 6, alignSelf: 'stretch' }}
            />
          </View>
        }
      />
    </ClayBackground>
  );
}
