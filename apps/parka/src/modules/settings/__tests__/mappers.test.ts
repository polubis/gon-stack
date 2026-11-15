import { describe, expect, it } from 'vitest';
import {
  toAvatar,
  toSettings,
  toSettingsDto,
  type AvatarDto,
  type SettingsDto,
} from '../integration/mappers';

const DTO: SettingsDto = {
  profile: { name: 'Ada' },
  notifications: {
    limitWarnings: true,
    receiptConfirmations: false,
    limitAlerts: true,
    push: false,
    email: true,
  },
  devices: [
    {
      id: 'device-aaaa-a3f9',
      name: 'Chrome on Android',
      type: 'mobile',
      avatar: null,
      customName: 'Phone',
      photo: null,
      model: 'SM-S918B',
      os: 'Android 14',
      browser: 'Chrome',
      screen: '412×915',
    },
  ],
};

describe('settings mappers', () => {
  it('keeps profile, switches and devices of the server settings', () => {
    expect(toSettings(DTO)).toEqual(DTO);
  });

  it('drops fields the module does not know', () => {
    const noisy = {
      ...DTO,
      profile: { name: 'Ada', secret: 'x' },
    } as unknown as SettingsDto;

    expect(toSettings(noisy).profile).toEqual({ name: 'Ada' });
  });

  it('sends back what was loaded', () => {
    expect(toSettingsDto(toSettings(DTO))).toEqual(DTO);
  });

  it('does not share device objects between the dto and the settings', () => {
    const settings = toSettings(DTO);

    expect(settings.devices[0]).not.toBe(DTO.devices[0]);
  });

  it('maps no avatar to null', () => {
    expect(toAvatar(null as unknown as AvatarDto)).toBeNull();
  });

  it('keeps every avatar size with its url', () => {
    const dto = {
      variants: [
        { size: 64, url: 'https://cdn.example.com/a-64.webp' },
        { size: 128, url: 'https://cdn.example.com/a-128.webp' },
      ],
    } as unknown as AvatarDto;

    expect(toAvatar(dto)).toEqual(dto);
  });
});
