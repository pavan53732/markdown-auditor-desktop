import React, { useState, useEffect } from 'react';

export default function SettingsModal({ open, config, onSave, onCancel }) {
  const [baseURL, setBaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (open) {
      setBaseURL(config.baseURL || '');
      setApiKey(config.apiKey || '');
      setModel(config.model || '');
      setShowKey(false);
      setValidating(false);
      setValidationResult(null);
    }
  }, [open, config]);

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);

    const result = await window.electronAPI.validateAPI({
      baseURL,
      apiKey,
      model
    });

    setValidationResult(result);
    setValidating(false);
  };

  const handleSave = () => {
    onSave({ baseURL, apiKey, model });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-lg mx-4 bg-[#1F2937] rounded-xl border border-[#374151] shadow-2xl">
        <div className="px-6 py-4 border-b border-[#374151]">
          <h2 className="text-lg font-semibold text-[#F9FAFB]">AI Provider Settings</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
              Base URL
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-[#60A5FA] transition-colors"
            />
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Any OpenAI-compatible endpoint
            </p>
            <div className="mt-1.5 space-y-0.5 text-xs text-[#4B5563]">
              <p>OpenAI: https://api.openai.com/v1</p>
              <p>OpenRouter: https://openrouter.ai/api/v1</p>
              <p>Ollama: http://localhost:11434/v1</p>
              <p>Groq: https://api.groq.com/openai/v1</p>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-[#60A5FA] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Leave blank for local providers like Ollama
            </p>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
              Model Name
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
              className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-[#60A5FA] transition-colors"
            />
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Exact model name your provider accepts
            </p>
            <div className="mt-1.5 space-y-0.5 text-xs text-[#4B5563]">
              <p>OpenAI: gpt-4o, gpt-4-turbo</p>
              <p>Anthropic: claude-sonnet-4-5</p>
              <p>Groq: llama3-70b-8192</p>
              <p>Ollama: llama3, mistral</p>
            </div>
          </div>

          {/* Validation result */}
          {validationResult && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                validationResult.success
                  ? 'bg-[#052e16] text-[#4ade80] border border-[#166534]'
                  : 'bg-[#3B1111] text-[#F87171] border border-[#A32D2D]'
              }`}
            >
              {validationResult.success ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{validationResult.message}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{validationResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 border-t border-[#374151] flex items-center gap-3">
          <button
            onClick={handleValidate}
            disabled={validating || !baseURL || !model}
            className="px-4 py-2 bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-[#F9FAFB] transition-colors flex items-center gap-2"
          >
            {validating && (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            )}
            Validate Connection
          </button>
          <button
            onClick={handleSave}
            disabled={!baseURL || !model}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[#9CA3AF] hover:text-[#F9FAFB] text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}