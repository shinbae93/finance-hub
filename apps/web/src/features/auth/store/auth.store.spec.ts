import { useAuthStore } from './auth.store';

const initial = useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState({ ...initial });
});

describe('useAuthStore', () => {
  it('starts unauthenticated', () => {
    const s = useAuthStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it('setSession stores token + user', () => {
    useAuthStore.getState().setSession('jwt', {
      id: 'u1',
      email: 'a@b.com',
      fullName: null,
      createdAt: '2026-05-14T00:00:00.000Z' as never,
    });
    const s = useAuthStore.getState();
    expect(s.accessToken).toBe('jwt');
    expect(s.user?.email).toBe('a@b.com');
  });

  it('clear empties the store', () => {
    useAuthStore.getState().setSession('jwt', {
      id: 'u1',
      email: 'a@b.com',
      fullName: null,
      createdAt: '2026-05-14T00:00:00.000Z' as never,
    });
    useAuthStore.getState().clear();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
