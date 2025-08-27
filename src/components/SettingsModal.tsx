import React from 'react';
import Modal from './Modal';
import { useSettings } from '../hooks/useSettings';
import { useIntl } from 'react-intl';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const { settings, setSettings } = useSettings();
  const intl = useIntl();
  return (
    <Modal open={open} onClose={onClose} title={intl.formatMessage({id:'settings.title'})}>
      <div className="space-y-4">
        <label className="block">
          <span>{intl.formatMessage({id:'settings.language'})}</span>
          <select
            className="mt-1 w-full border rounded-md p-2 bg-white dark:bg-gray-800"
            value={settings.language}
            onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span>{intl.formatMessage({id:'settings.currency'})}</span>
          <select
            className="mt-1 w-full border rounded-md p-2 bg-white dark:bg-gray-800"
            value={settings.currency}
            onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
          >
            {currencies.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
