import {
  Provider,
  useContext,
} from '@/shared/user-profile/presentation/context';
import { UserProfileDropdown } from './user-profile-dropdown';
import { useEffect } from 'react';

const UserProfileContent = () => {
  const { trigger } = useContext();

  useEffect(() => {
    trigger('[TRIGGER]_GET_USER_PROFILE');
  }, [trigger]);

  return <UserProfileDropdown />;
};

export const UserProfile = () => (
  <Provider>
    <UserProfileContent />
  </Provider>
);
