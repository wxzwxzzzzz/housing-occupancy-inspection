/**
 * @see https://umijs.org/docs/max/access#access
 */
import { userStore } from './stores';

export default function access() {
  return {
    canAdmin: userStore.role === 'ADMIN',
  };
}
