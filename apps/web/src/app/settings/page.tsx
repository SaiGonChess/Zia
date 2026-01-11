'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  settingsApiClient,
  type BotSettings,
  type RetryConfig,
  type HistoryLoaderConfig,
  type FetchConfig,
  type StickersConfig,
  type LoggerConfig,
  type ReactionConfig,
  type FriendRequestConfig,
  type MessageChunkerConfig,
  type MessageStoreConfig,
  type JikanConfig,
  type ElevenLabsConfig,
  type GiphyConfig,
  type NekosConfig,
  type FreepikConfig,
  type MessageSenderConfig,
  type MarkdownConfig,
  type TvuConfig,
  type GroqConfig,
  type DatabaseConfig,
  type ResponseHandlerConfig,
  type GroupMembersFetchConfig,
  type GoogleTtsConfig,
  type SandboxConfig
} from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Settings,
  AlertTriangle,
  RefreshCw,
  Save,
  Bot,
  Puzzle,
  Wrench,
  Zap,
  Shield,
  MessageSquare,
  Brain,
  Moon,
  Cloud,
  Clock,
  Database,
  Users,
  Volume2,
  Image,
  Globe,
  MessageCircle,
  Server,
  Timer,
  HardDrive,
  Mic,
  Palette,
  Send,
  Heart,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<BotSettings | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsApiClient.get();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data) setLocalSettings(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (settings: BotSettings) => settingsApiClient.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Đã lưu settings');
    },
    onError: () => toast.error('Lỗi khi lưu settings'),
  });

  const reloadMutation = useMutation({
    mutationFn: () => settingsApiClient.reload(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Đã reload settings');
    },
    onError: () => toast.error('Lỗi khi reload settings'),
  });

  // Update helpers
  const updateBotSetting = <K extends keyof BotSettings['bot']>(key: K, value: BotSettings['bot'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      bot: { ...localSettings.bot, [key]: value },
    });
  };

  const updateModule = (key: string, value: boolean) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      modules: { ...localSettings.modules, [key]: value },
    });
  };

  const updateMaintenanceMode = (key: 'enabled' | 'message', value: boolean | string) => {
    if (!localSettings) return;
    const currentMaintenance = localSettings.bot.maintenanceMode ?? {
      enabled: false,
      message: '🔧 Bot đang trong chế độ bảo trì. Vui lòng thử lại sau!',
    };
    setLocalSettings({
      ...localSettings,
      bot: {
        ...localSettings.bot,
        maintenanceMode: { ...currentMaintenance, [key]: value },
      },
    });
  };

  const updateSleepMode = <K extends keyof BotSettings['bot']['sleepMode']>(
    key: K,
    value: BotSettings['bot']['sleepMode'][K]
  ) => {
    if (!localSettings) return;
    const currentSleep = localSettings.bot.sleepMode ?? {
      enabled: false,
      sleepHour: 23,
      wakeHour: 6,
      checkIntervalMs: 1800000,
    };
    setLocalSettings({
      ...localSettings,
      bot: {
        ...localSettings.bot,
        sleepMode: { ...currentSleep, [key]: value },
      },
    });
  };

  const updateGemini = <K extends keyof BotSettings['gemini']>(key: K, value: BotSettings['gemini'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      gemini: { ...localSettings.gemini, [key]: value },
    });
  };

  const updateGroqModels = <K extends keyof BotSettings['groqModels']>(key: K, value: BotSettings['groqModels'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      groqModels: { ...localSettings.groqModels, [key]: value },
    });
  };

  const updateBuffer = <K extends keyof BotSettings['buffer']>(key: K, value: BotSettings['buffer'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      buffer: { ...localSettings.buffer, [key]: value },
    });
  };

  const updateHistory = <K extends keyof BotSettings['history']>(key: K, value: BotSettings['history'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      history: { ...localSettings.history, [key]: value },
    });
  };

  const updateMemory = <K extends keyof BotSettings['memory']>(key: K, value: BotSettings['memory'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      memory: { ...localSettings.memory, [key]: value },
    });
  };

  const updateCloudBackup = <K extends keyof BotSettings['cloudBackup']>(key: K, value: BotSettings['cloudBackup'][K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      cloudBackup: { ...localSettings.cloudBackup, [key]: value },
    });
  };

  const updateBackgroundAgent = <K extends keyof BotSettings['backgroundAgent']>(
    key: K,
    value: BotSettings['backgroundAgent'][K]
  ) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      backgroundAgent: { ...localSettings.backgroundAgent, [key]: value },
    });
  };

  const updateAllowedUserIds = (value: string) => {
    if (!localSettings) return;
    const ids = value.split('\n').map((id) => id.trim()).filter(Boolean);
    setLocalSettings({
      ...localSettings,
      allowedUserIds: ids,
    });
  };

  const updateBlockedUserIds = (value: string) => {
    if (!localSettings) return;
    const ids = value.split('\n').map((id) => id.trim()).filter(Boolean);
    setLocalSettings({
      ...localSettings,
      blockedUserIds: ids,
    });
  };

  const updateElevenlabs = <K extends keyof ElevenLabsConfig>(key: K, value: ElevenLabsConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      elevenlabs: { ...localSettings.elevenlabs, [key]: value },
    });
  };

  const updateGiphy = <K extends keyof GiphyConfig>(key: K, value: GiphyConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      giphy: { ...localSettings.giphy, [key]: value },
    });
  };

  const updateJikan = <K extends keyof JikanConfig>(key: K, value: JikanConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      jikan: { ...localSettings.jikan, [key]: value },
    });
  };

  const updateFreepik = <K extends keyof FreepikConfig>(key: K, value: FreepikConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      freepik: { ...localSettings.freepik, [key]: value },
    });
  };

  const updateMessageStore = <K extends keyof MessageStoreConfig>(key: K, value: MessageStoreConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      messageStore: { ...localSettings.messageStore, [key]: value },
    });
  };

  const updateResponseHandler = <K extends keyof ResponseHandlerConfig>(key: K, value: ResponseHandlerConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      responseHandler: { ...localSettings.responseHandler, [key]: value },
    });
  };

  const updateDatabase = <K extends keyof DatabaseConfig>(key: K, value: DatabaseConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      database: { ...localSettings.database, [key]: value },
    });
  };

  const updateStickers = (keywords: string[]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      stickers: { ...localSettings.stickers, keywords },
    });
  };

  const updateRetry = <K extends keyof RetryConfig>(key: K, value: RetryConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      retry: { ...localSettings.retry, [key]: value },
    });
  };

  const updateHistoryLoader = <K extends keyof HistoryLoaderConfig>(key: K, value: HistoryLoaderConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      historyLoader: { ...localSettings.historyLoader, [key]: value },
    });
  };

  const updateFetch = <K extends keyof FetchConfig>(key: K, value: FetchConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      fetch: { ...localSettings.fetch, [key]: value },
    });
  };

  const updateLogger = <K extends keyof LoggerConfig>(key: K, value: LoggerConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      logger: { ...localSettings.logger, [key]: value },
    });
  };

  const updateReaction = <K extends keyof ReactionConfig>(key: K, value: ReactionConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      reaction: { ...localSettings.reaction, [key]: value },
    });
  };

  const updateFriendRequest = <K extends keyof FriendRequestConfig>(key: K, value: FriendRequestConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      friendRequest: { ...localSettings.friendRequest, [key]: value },
    });
  };

  const updateMessageChunker = <K extends keyof MessageChunkerConfig>(key: K, value: MessageChunkerConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      messageChunker: { ...localSettings.messageChunker, [key]: value },
    });
  };

  const updateMessageSender = <K extends keyof MessageSenderConfig>(key: K, value: MessageSenderConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      messageSender: { ...localSettings.messageSender, [key]: value },
    });
  };

  const updateMarkdown = <K extends keyof MarkdownConfig>(key: K, value: MarkdownConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      markdown: { ...localSettings.markdown, [key]: value },
    });
  };

  const updateTvu = <K extends keyof TvuConfig>(key: K, value: TvuConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      tvu: { ...localSettings.tvu, [key]: value },
    });
  };

  const updateGroq = <K extends keyof GroqConfig>(key: K, value: GroqConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      groq: { ...localSettings.groq, [key]: value },
    });
  };

  const updateSandbox = <K extends keyof SandboxConfig>(key: K, value: SandboxConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      sandbox: { ...localSettings.sandbox, [key]: value },
    });
  };

  const updateGroupMembersFetch = <K extends keyof GroupMembersFetchConfig>(key: K, value: GroupMembersFetchConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      groupMembersFetch: { ...localSettings.groupMembersFetch, [key]: value },
    });
  };

  const updateGoogleTts = <K extends keyof GoogleTtsConfig>(key: K, value: GoogleTtsConfig[K]) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      googleTts: { ...localSettings.googleTts, [key]: value },
    });
  };

  if (isLoading || !localSettings) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="h-[500px] bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }


  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#777777] text-white shadow-[0_4px_0_0_#5A5A5A]">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
            <p className="text-muted-foreground font-medium">Cấu hình bot</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => reloadMutation.mutate()}
            disabled={reloadMutation.isPending}
            className="h-11 px-4 rounded-xl border-2 font-semibold hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reloadMutation.isPending ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
          <Button
            onClick={() => updateMutation.mutate(localSettings)}
            disabled={updateMutation.isPending}
            className="h-11 px-5 rounded-xl font-semibold bg-[#58CC02] hover:bg-[#4CAF00] text-white shadow-[0_4px_0_0_#46A302] hover:shadow-[0_2px_0_0_#46A302] hover:translate-y-[2px] transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="h-12 p-1 rounded-xl bg-muted border-2 border-border flex-wrap">
          <TabsTrigger value="general" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Bot className="h-4 w-4 mr-2" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="ai" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="modules" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Puzzle className="h-4 w-4 mr-2" />
            Mô-đun
          </TabsTrigger>
          <TabsTrigger value="integrations" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4 mr-2" />
            Tích hợp
          </TabsTrigger>
          <TabsTrigger value="performance" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4 mr-2" />
            Hiệu suất
          </TabsTrigger>
          <TabsTrigger value="advanced" className="h-10 px-4 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Wrench className="h-4 w-4 mr-2" />
            Nâng cao
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Maintenance Mode Card */}
          <div className={`rounded-2xl border-2 p-6 transition-colors ${
            localSettings.bot.maintenanceMode?.enabled
              ? 'border-[#FF9600]/50 bg-[#FF9600]/5'
              : 'border-border bg-card'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                localSettings.bot.maintenanceMode?.enabled
                  ? 'bg-[#FF9600] text-white shadow-[0_4px_0_0_#E68600]'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Chế độ bảo trì</h3>
                <p className="text-sm text-muted-foreground">Khi bật, bot sẽ chỉ phản hồi thông báo bảo trì</p>
              </div>
              <Switch
                checked={localSettings.bot.maintenanceMode?.enabled ?? false}
                onCheckedChange={(v) => updateMaintenanceMode('enabled', v)}
                className="data-[state=checked]:bg-[#FF9600]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Thông báo bảo trì</Label>
              <Textarea
                value={localSettings.bot.maintenanceMode?.message ?? '🔧 Bot đang trong chế độ bảo trì. Vui lòng thử lại sau!'}
                onChange={(e) => updateMaintenanceMode('message', e.target.value)}
                placeholder="Nhập thông báo hiển thị khi bot đang bảo trì..."
                rows={2}
                className="rounded-xl border-2 resize-none"
              />
            </div>
          </div>

          {/* Sleep Mode Card */}
          <div className={`rounded-2xl border-2 p-6 transition-colors ${
            localSettings.bot.sleepMode?.enabled
              ? 'border-[#CE82FF]/50 bg-[#CE82FF]/5'
              : 'border-border bg-card'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                localSettings.bot.sleepMode?.enabled
                  ? 'bg-[#CE82FF] text-white shadow-[0_4px_0_0_#B86EE6]'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Moon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Chế độ ngủ</h3>
                <p className="text-sm text-muted-foreground">Tự động offline theo giờ đã cài đặt</p>
              </div>
              <Switch
                checked={localSettings.bot.sleepMode?.enabled ?? false}
                onCheckedChange={(v) => updateSleepMode('enabled', v)}
                className="data-[state=checked]:bg-[#CE82FF]"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Giờ ngủ (0-23)</Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={localSettings.bot.sleepMode?.sleepHour ?? 23}
                  onChange={(e) => updateSleepMode('sleepHour', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Giờ thức (0-23)</Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={localSettings.bot.sleepMode?.wakeHour ?? 6}
                  onChange={(e) => updateSleepMode('wakeHour', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Bot Settings Card */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Cài đặt Bot</h3>
                <p className="text-sm text-muted-foreground">Cấu hình cơ bản của bot</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tên bot</Label>
                  <Input
                    value={localSettings.bot.name}
                    onChange={(e) => updateBotSetting('name', e.target.value)}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tiền tố</Label>
                  <Input
                    value={localSettings.bot.prefix}
                    onChange={(e) => updateBotSetting('prefix', e.target.value)}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <SettingToggle
                  label="Yêu cầu tiền tố"
                  description="Bắt buộc dùng tiền tố để gọi bot"
                  checked={localSettings.bot.requirePrefix}
                  onCheckedChange={(v) => updateBotSetting('requirePrefix', v)}
                  icon={MessageSquare}
                  color="#1CB0F6"
                />
                <SettingToggle
                  label="Phát trực tiếp"
                  description="Gửi tin nhắn theo luồng (streaming)"
                  checked={localSettings.bot.useStreaming}
                  onCheckedChange={(v) => updateBotSetting('useStreaming', v)}
                  icon={Zap}
                  color="#FF9600"
                />
                <SettingToggle
                  label="Hiện lệnh gọi công cụ"
                  description="Hiển thị khi bot gọi công cụ"
                  checked={localSettings.bot.showToolCalls}
                  onCheckedChange={(v) => updateBotSetting('showToolCalls', v)}
                  icon={Wrench}
                  color="#CE82FF"
                />
                <SettingToggle
                  label="Ghi nhật ký"
                  description="Ghi nhật ký hoạt động"
                  checked={localSettings.bot.logging}
                  onCheckedChange={(v) => updateBotSetting('logging', v)}
                  icon={Settings}
                  color="#777777"
                />
                <SettingToggle
                  label="Sử dụng nhân vật"
                  description="Sử dụng character/persona cho bot"
                  checked={localSettings.bot.useCharacter}
                  onCheckedChange={(v) => updateBotSetting('useCharacter', v)}
                  icon={Users}
                  color="#1CB0F6"
                />
              </div>
            </div>
          </div>
        </TabsContent>


        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* Gemini Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Gemini AI</h3>
                <p className="text-sm text-muted-foreground">Cấu hình model Gemini</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Temperature: {localSettings.gemini?.temperature ?? 1}</Label>
                  </div>
                  <Slider
                    value={[localSettings.gemini?.temperature ?? 1]}
                    onValueChange={([v]) => updateGemini('temperature', v)}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Độ sáng tạo của AI (0 = chính xác, 2 = sáng tạo)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Top P: {localSettings.gemini?.topP ?? 0.95}</Label>
                  </div>
                  <Slider
                    value={[localSettings.gemini?.topP ?? 0.95]}
                    onValueChange={([v]) => updateGemini('topP', v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Nucleus sampling (0.1 = tập trung, 1 = đa dạng)</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Output Tokens</Label>
                  <Input
                    type="number"
                    value={localSettings.gemini?.maxOutputTokens ?? 65536}
                    onChange={(e) => updateGemini('maxOutputTokens', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Thinking Budget</Label>
                  <Input
                    type="number"
                    value={localSettings.gemini?.thinkingBudget ?? 8192}
                    onChange={(e) => updateGemini('thinkingBudget', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Models (mỗi dòng 1 model)</Label>
                <Textarea
                  value={(localSettings.gemini?.models ?? []).join('\n')}
                  onChange={(e) => updateGemini('models', e.target.value.split('\n').filter(Boolean))}
                  placeholder="models/gemini-3-flash-preview"
                  rows={3}
                  className="rounded-xl border-2 resize-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Groq Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9600] text-white shadow-[0_3px_0_0_#E68600]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Groq (Background Agent)</h3>
                <p className="text-sm text-muted-foreground">Cấu hình model Groq cho background tasks</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Primary Model</Label>
                  <Input
                    value={localSettings.groqModels?.primary ?? ''}
                    onChange={(e) => updateGroqModels('primary', e.target.value)}
                    className="h-11 rounded-xl border-2 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Fallback Model</Label>
                  <Input
                    value={localSettings.groqModels?.fallback ?? ''}
                    onChange={(e) => updateGroqModels('fallback', e.target.value)}
                    className="h-11 rounded-xl border-2 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Temperature: {localSettings.groqModels?.temperature ?? 0.7}</Label>
                  </div>
                  <Slider
                    value={[localSettings.groqModels?.temperature ?? 0.7]}
                    onValueChange={([v]) => updateGroqModels('temperature', v)}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Top P: {localSettings.groqModels?.topP ?? 0.95}</Label>
                  </div>
                  <Slider
                    value={[localSettings.groqModels?.topP ?? 0.95]}
                    onValueChange={([v]) => updateGroqModels('topP', v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Primary Max Tokens</Label>
                  <Input
                    type="number"
                    value={localSettings.groqModels?.primaryMaxTokens ?? 65536}
                    onChange={(e) => updateGroqModels('primaryMaxTokens', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Fallback Max Tokens</Label>
                  <Input
                    type="number"
                    value={localSettings.groqModels?.fallbackMaxTokens ?? 16384}
                    onChange={(e) => updateGroqModels('fallbackMaxTokens', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Rate Limit Cooldown (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.groq?.rateLimitCooldownMs ?? 60000}
                  onChange={(e) => updateGroq('rateLimitCooldownMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Background Agent Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Tác vụ Ngầm (Background)</h3>
                <p className="text-sm text-muted-foreground">Tự động xử lý dữ liệu khi rảnh rỗi</p>
              </div>
            </div>

            <div className="space-y-6">
              <SettingToggle
                label="Dùng Groq siêu tốc"
                description="Xử lý cực nhanh, giảm tải cho bot chính"
                checked={localSettings.backgroundAgent?.groqEnabled ?? true}
                onCheckedChange={(v) => updateBackgroundAgent('groqEnabled', v)}
                icon={Zap}
                color="#FF9600"
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Poll Interval (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.backgroundAgent?.pollIntervalMs ?? 90000}
                    onChange={(e) => updateBackgroundAgent('pollIntervalMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Tool Iterations</Label>
                  <Input
                    type="number"
                    value={localSettings.backgroundAgent?.maxToolIterations ?? 5}
                    onChange={(e) => updateBackgroundAgent('maxToolIterations', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Group Batch Size</Label>
                  <Input
                    type="number"
                    value={localSettings.backgroundAgent?.groupBatchSize ?? 10}
                    onChange={(e) => updateBackgroundAgent('groupBatchSize', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>


        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                <Puzzle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mô-đun</h3>
                <p className="text-sm text-muted-foreground">Bật/tắt các mô-đun của bot</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(localSettings.modules).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border-2 border-transparent hover:border-[#CE82FF]/30 transition-colors"
                >
                  <div>
                    <span className="font-semibold capitalize">{key}</span>
                    <p className="text-xs text-muted-foreground">{getModuleDescription(key)}</p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(v) => updateModule(key, v)}
                    className="data-[state=checked]:bg-[#CE82FF]"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Google TTS Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Google TTS</h3>
                <p className="text-sm text-muted-foreground">Cấu hình Google Text-to-Speech miễn phí</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Ngôn ngữ mặc định</Label>
                <Input
                  value={localSettings.googleTts?.defaultLanguage ?? 'vi'}
                  onChange={(e) => updateGoogleTts('defaultLanguage', e.target.value)}
                  className="h-11 rounded-xl border-2 font-mono text-sm"
                  placeholder="vi"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tốc độ nói: {localSettings.googleTts?.defaultSpeakingRate ?? 1}</Label>
                <Slider
                  value={[localSettings.googleTts?.defaultSpeakingRate ?? 1]}
                  onValueChange={([v]) => updateGoogleTts('defaultSpeakingRate', v)}
                  min={0.25}
                  max={4.0}
                  step={0.25}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Âm lượng (dB): {localSettings.googleTts?.defaultVolumeGainDb ?? 0}</Label>
                <Slider
                  value={[localSettings.googleTts?.defaultVolumeGainDb ?? 0]}
                  onValueChange={([v]) => updateGoogleTts('defaultVolumeGainDb', v)}
                  min={-10}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* ElevenLabs Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ElevenLabs</h3>
                <p className="text-sm text-muted-foreground">Cấu hình Text-to-Speech</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Voice ID mặc định</Label>
                  <Input
                    value={localSettings.elevenlabs?.defaultVoiceId ?? ''}
                    onChange={(e) => updateElevenlabs('defaultVoiceId', e.target.value)}
                    className="h-11 rounded-xl border-2 font-mono text-sm"
                    placeholder="fUjY9K2nAIwlALOwSiwc"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Model ID</Label>
                  <Input
                    value={localSettings.elevenlabs?.defaultModelId ?? ''}
                    onChange={(e) => updateElevenlabs('defaultModelId', e.target.value)}
                    className="h-11 rounded-xl border-2 font-mono text-sm"
                    placeholder="eleven_v3"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stability: {localSettings.elevenlabs?.defaultStability ?? 0.5}</Label>
                  <Slider
                    value={[localSettings.elevenlabs?.defaultStability ?? 0.5]}
                    onValueChange={([v]) => updateElevenlabs('defaultStability', v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Similarity Boost: {localSettings.elevenlabs?.defaultSimilarityBoost ?? 0.75}</Label>
                  <Slider
                    value={[localSettings.elevenlabs?.defaultSimilarityBoost ?? 0.75]}
                    onValueChange={([v]) => updateElevenlabs('defaultSimilarityBoost', v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Style: {localSettings.elevenlabs?.defaultStyle ?? 0.5}</Label>
                  <Slider
                    value={[localSettings.elevenlabs?.defaultStyle ?? 0.5]}
                    onValueChange={([v]) => updateElevenlabs('defaultStyle', v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Giphy Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9600] text-white shadow-[0_3px_0_0_#E68600]">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Giphy</h3>
                <p className="text-sm text-muted-foreground">Cấu hình tìm kiếm GIF</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.giphy?.timeoutMs ?? 15000}
                  onChange={(e) => updateGiphy('timeoutMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Default Limit</Label>
                <Input
                  type="number"
                  value={localSettings.giphy?.defaultLimit ?? 10}
                  onChange={(e) => updateGiphy('defaultLimit', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Rating</Label>
                <Input
                  value={localSettings.giphy?.defaultRating ?? 'g'}
                  onChange={(e) => updateGiphy('defaultRating', e.target.value)}
                  className="h-11 rounded-xl border-2"
                  placeholder="g, pg, pg-13, r"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Retry Limit</Label>
                <Input
                  type="number"
                  value={localSettings.giphy?.retryLimit ?? 2}
                  onChange={(e) => updateGiphy('retryLimit', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Jikan Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Jikan (MyAnimeList)</h3>
                <p className="text-sm text-muted-foreground">Cấu hình API Anime/Manga</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Rate Limit Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.jikan?.rateLimitDelayMs ?? 350}
                  onChange={(e) => updateJikan('rateLimitDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.jikan?.timeoutMs ?? 15000}
                  onChange={(e) => updateJikan('timeoutMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Retry Limit</Label>
                <Input
                  type="number"
                  value={localSettings.jikan?.retryLimit ?? 3}
                  onChange={(e) => updateJikan('retryLimit', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Backoff Limit (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.jikan?.backoffLimitMs ?? 3000}
                  onChange={(e) => updateJikan('backoffLimitMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Freepik Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Freepik</h3>
                <p className="text-sm text-muted-foreground">Cấu hình tạo ảnh AI</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.freepik?.timeoutMs ?? 60000}
                  onChange={(e) => updateFreepik('timeoutMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Poll Attempts</Label>
                <Input
                  type="number"
                  value={localSettings.freepik?.pollMaxAttempts ?? 30}
                  onChange={(e) => updateFreepik('pollMaxAttempts', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Poll Interval (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.freepik?.pollIntervalMs ?? 2000}
                  onChange={(e) => updateFreepik('pollIntervalMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Retry Limit</Label>
                <Input
                  type="number"
                  value={localSettings.freepik?.retryLimit ?? 2}
                  onChange={(e) => updateFreepik('retryLimit', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* TVU Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">TVU Service</h3>
                <p className="text-sm text-muted-foreground">Cấu hình dịch vụ TikVideoUrl</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.tvu?.timeoutMs ?? 10000}
                  onChange={(e) => updateTvu('timeoutMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Retry Limit</Label>
                <Input
                  type="number"
                  value={localSettings.tvu?.retryLimit ?? 2}
                  onChange={(e) => updateTvu('retryLimit', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Stickers Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF4B4B] text-white shadow-[0_3px_0_0_#E63E3E]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Stickers</h3>
                <p className="text-sm text-muted-foreground">Từ khóa cho sticker (mỗi dòng 1 từ khóa)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                value={(localSettings.stickers?.keywords ?? []).join('\n')}
                onChange={(e) => updateStickers(e.target.value.split('\n').filter(Boolean))}
                placeholder="hello&#10;hi&#10;love&#10;haha..."
                rows={4}
                className="rounded-xl border-2 resize-none font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Buffer Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Buffer & Timing</h3>
                <p className="text-sm text-muted-foreground">Cấu hình độ trễ và buffer</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Buffer Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.buffer?.delayMs ?? 2500}
                  onChange={(e) => updateBuffer('delayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
                <p className="text-xs text-muted-foreground">Độ trễ trước khi xử lý tin nhắn</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Typing Refresh (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.buffer?.typingRefreshMs ?? 3000}
                  onChange={(e) => updateBuffer('typingRefreshMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
                <p className="text-xs text-muted-foreground">Tần suất refresh trạng thái đang gõ</p>
              </div>
            </div>
          </div>

          {/* History Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">History & Context</h3>
                <p className="text-sm text-muted-foreground">Cấu hình lịch sử và context</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Context Tokens</Label>
                <Input
                  type="number"
                  value={localSettings.history?.maxContextTokens ?? 300000}
                  onChange={(e) => updateHistory('maxContextTokens', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Token History</Label>
                <Input
                  type="number"
                  value={localSettings.bot.maxTokenHistory}
                  onChange={(e) => updateBotSetting('maxTokenHistory', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Input Tokens</Label>
                <Input
                  type="number"
                  value={localSettings.bot.maxInputTokens}
                  onChange={(e) => updateBotSetting('maxInputTokens', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Memory Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9600] text-white shadow-[0_3px_0_0_#E68600]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Memory</h3>
                <p className="text-sm text-muted-foreground">Cấu hình bộ nhớ chung (shared memory)</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Decay Half-Life (days)</Label>
                <Input
                  type="number"
                  value={localSettings.memory?.decayHalfLifeDays ?? 30}
                  onChange={(e) => updateMemory('decayHalfLifeDays', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
                <p className="text-xs text-muted-foreground">Thời gian giảm một nửa độ quan trọng</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Access Boost Factor</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={localSettings.memory?.accessBoostFactor ?? 0.2}
                  onChange={(e) => updateMemory('accessBoostFactor', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
                <p className="text-xs text-muted-foreground">Hệ số tăng khi truy cập</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Embedding Model</Label>
                <Input
                  value={localSettings.memory?.embeddingModel ?? 'gemini-embedding-001'}
                  onChange={(e) => updateMemory('embeddingModel', e.target.value)}
                  className="h-11 rounded-xl border-2 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cloud Backup Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Cloud Backup</h3>
                <p className="text-sm text-muted-foreground">Cấu hình sao lưu đám mây</p>
              </div>
            </div>

            <div className="space-y-6">
              <SettingToggle
                label="Bật Cloud Backup"
                description="Tự động sao lưu lên cloud"
                checked={localSettings.cloudBackup?.enabled ?? true}
                onCheckedChange={(v) => updateCloudBackup('enabled', v)}
                icon={Cloud}
                color="#CE82FF"
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Throttle (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.cloudBackup?.throttleMs ?? 10000}
                    onChange={(e) => updateCloudBackup('throttleMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Restore Delay (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.cloudBackup?.restoreDelayMs ?? 15000}
                    onChange={(e) => updateCloudBackup('restoreDelayMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Initial Backup Delay (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.cloudBackup?.initialBackupDelayMs ?? 30000}
                    onChange={(e) => updateCloudBackup('initialBackupDelayMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Store Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Message Store</h3>
                <p className="text-sm text-muted-foreground">Cấu hình lưu trữ tin nhắn</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Cache/Thread</Label>
                <Input
                  type="number"
                  value={localSettings.messageStore?.maxCachePerThread ?? 20}
                  onChange={(e) => updateMessageStore('maxCachePerThread', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cleanup Interval (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.messageStore?.cleanupIntervalMs ?? 1800000}
                  onChange={(e) => updateMessageStore('cleanupIntervalMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Recent Window (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.messageStore?.recentMessageWindowMs ?? 300000}
                  onChange={(e) => updateMessageStore('recentMessageWindowMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Undo Time (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.messageStore?.maxUndoTimeMs ?? 120000}
                  onChange={(e) => updateMessageStore('maxUndoTimeMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Response Handler Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9600] text-white shadow-[0_3px_0_0_#E68600]">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Response Handler</h3>
                <p className="text-sm text-muted-foreground">Cấu hình độ trễ phản hồi</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Reaction Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.reactionDelayMs ?? 300}
                  onChange={(e) => updateResponseHandler('reactionDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Chunk Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.chunkDelayMs ?? 300}
                  onChange={(e) => updateResponseHandler('chunkDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Sticker Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.stickerDelayMs ?? 800}
                  onChange={(e) => updateResponseHandler('stickerDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Card Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.cardDelayMs ?? 500}
                  onChange={(e) => updateResponseHandler('cardDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Message Delay Min (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.messageDelayMinMs ?? 500}
                  onChange={(e) => updateResponseHandler('messageDelayMinMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Message Delay Max (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.messageDelayMaxMs ?? 1000}
                  onChange={(e) => updateResponseHandler('messageDelayMaxMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Image Delay (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.responseHandler?.imageDelayMs ?? 500}
                  onChange={(e) => updateResponseHandler('imageDelayMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Database</h3>
                <p className="text-sm text-muted-foreground">Cấu hình cơ sở dữ liệu</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Path</Label>
                <Input
                  value={localSettings.database?.path ?? 'data/bot.db'}
                  onChange={(e) => updateDatabase('path', e.target.value)}
                  className="h-11 rounded-xl border-2 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cleanup Interval (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.database?.cleanupIntervalMs ?? 3600000}
                  onChange={(e) => updateDatabase('cleanupIntervalMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Embedding Dim</Label>
                <Input
                  type="number"
                  value={localSettings.database?.embeddingDim ?? 768}
                  onChange={(e) => updateDatabase('embeddingDim', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cache Size</Label>
                <Input
                  type="number"
                  value={localSettings.database?.cacheSize ?? 10000}
                  onChange={(e) => updateDatabase('cacheSize', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>

          {/* History Loader Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">History Loader</h3>
                <p className="text-sm text-muted-foreground">Cấu hình tải lịch sử</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <SettingToggle
                  label="Bật History Loader"
                  description="Cho phép tải lịch sử"
                  checked={localSettings.historyLoader?.enabled ?? false}
                  onCheckedChange={(v) => updateHistoryLoader('enabled', v)}
                  icon={Database}
                  color="#58CC02"
                />
                <SettingToggle
                  label="Load từ DB"
                  description="Tải từ cơ sở dữ liệu"
                  checked={localSettings.historyLoader?.loadFromDb ?? true}
                  onCheckedChange={(v) => updateHistoryLoader('loadFromDb', v)}
                  icon={HardDrive}
                  color="#1CB0F6"
                />
                <SettingToggle
                  label="Load User"
                  description="Tải lịch sử user"
                  checked={localSettings.historyLoader?.loadUser ?? true}
                  onCheckedChange={(v) => updateHistoryLoader('loadUser', v)}
                  icon={Users}
                  color="#CE82FF"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Delay (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.historyLoader?.maxDelayMs ?? 5000}
                    onChange={(e) => updateHistoryLoader('maxDelayMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Min Delay (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.historyLoader?.minDelayMs ?? 2000}
                    onChange={(e) => updateHistoryLoader('minDelayMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Default Limit</Label>
                  <Input
                    type="number"
                    value={localSettings.historyLoader?.defaultLimit ?? 1000}
                    onChange={(e) => updateHistoryLoader('defaultLimit', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Page Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.historyLoader?.pageTimeoutMs ?? 10000}
                    onChange={(e) => updateHistoryLoader('pageTimeoutMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Chunker & Group Fetch */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Message Chunker</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình chia nhỏ tin nhắn</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Max Message Length</Label>
                <Input
                  type="number"
                  value={localSettings.messageChunker?.maxMessageLength ?? 1800}
                  onChange={(e) => updateMessageChunker('maxMessageLength', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Group Members Fetch</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình tải thành viên nhóm</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Delay Min (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.groupMembersFetch?.delayMinMs ?? 300}
                    onChange={(e) => updateGroupMembersFetch('delayMinMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Delay Max (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.groupMembersFetch?.delayMaxMs ?? 800}
                    onChange={(e) => updateGroupMembersFetch('delayMaxMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>


        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF4B4B] text-white shadow-[0_3px_0_0_#E63E3E]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Cấu hình nâng cao</h3>
                <p className="text-sm text-muted-foreground">Các thiết lập nâng cao</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-xl border-2 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="h-4 w-4 text-[#1CB0F6]" />
                    <h4 className="font-bold">Message Sender</h4>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Media Delay (ms)</Label>
                      <Input
                        type="number"
                        value={localSettings.messageSender?.mediaDelayMs ?? 300}
                        onChange={(e) => updateMessageSender('mediaDelayMs', Number(e.target.value))}
                        className="h-11 rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Chunk Delay (ms)</Label>
                      <Input
                        type="number"
                        value={localSettings.messageSender?.chunkDelayMs ?? 400}
                        onChange={(e) => updateMessageSender('chunkDelayMs', Number(e.target.value))}
                        className="h-11 rounded-xl border-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border-2 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-[#CE82FF]" />
                    <h4 className="font-bold">Markdown Renderer</h4>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Mermaid Timeout</Label>
                      <Input
                        type="number"
                        value={localSettings.markdown?.mermaidTimeoutMs ?? 30000}
                        onChange={(e) => updateMarkdown('mermaidTimeoutMs', Number(e.target.value))}
                        className="h-11 rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Media Size Limit (MB)</Label>
                      <Input
                        type="number"
                        value={localSettings.markdown?.groupMediaSizeLimitMB ?? 1}
                        onChange={(e) => updateMarkdown('groupMediaSizeLimitMB', Number(e.target.value))}
                        className="h-11 rounded-xl border-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Độ sâu công cụ tối đa</Label>
                  <Input
                    type="number"
                    value={localSettings.bot.maxToolDepth}
                    onChange={(e) => updateBotSetting('maxToolDepth', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Giới hạn tốc độ (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.bot.rateLimitMs}
                    onChange={(e) => updateBotSetting('rateLimitMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Admin User ID</Label>
                  <Input
                    value={localSettings.adminUserId}
                    onChange={(e) => setLocalSettings({ ...localSettings, adminUserId: e.target.value })}
                    className="h-11 rounded-xl border-2 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <SettingToggle
                  label="Cho phép NSFW"
                  description="Cho phép nội dung người lớn"
                  checked={localSettings.bot.allowNSFW}
                  onCheckedChange={(v) => updateBotSetting('allowNSFW', v)}
                  icon={Shield}
                  color="#FF4B4B"
                />
                <SettingToggle
                  label="Tự nghe"
                  description="Bot nghe tin nhắn của chính mình"
                  checked={localSettings.bot.selfListen}
                  onCheckedChange={(v) => updateBotSetting('selfListen', v)}
                  icon={MessageSquare}
                  color="#1CB0F6"
                />
                <SettingToggle
                  label="Ghi log ra file"
                  description="Ghi nhật ký ra file thay vì console"
                  checked={localSettings.bot.fileLogging}
                  onCheckedChange={(v) => updateBotSetting('fileLogging', v)}
                  icon={Database}
                  color="#777777"
                />
              </div>
            </div>
          </div>

          {/* Allowed User IDs */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Allowed User IDs</h3>
                <p className="text-sm text-muted-foreground">Danh sách user ID được phép sử dụng bot (để trống = tất cả)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">User IDs (mỗi dòng 1 ID)</Label>
              <Textarea
                value={(localSettings.allowedUserIds ?? []).join('\n')}
                onChange={(e) => updateAllowedUserIds(e.target.value)}
                placeholder="Để trống để cho phép tất cả user..."
                rows={4}
                className="rounded-xl border-2 resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Blocked User IDs */}
          <div className="rounded-2xl border-2 border-[#FF4B4B]/30 bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF4B4B] text-white shadow-[0_3px_0_0_#E63E3E]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Blocked User IDs (Blacklist)</h3>
                <p className="text-sm text-muted-foreground">Danh sách user ID bị chặn hoàn toàn khỏi bot</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">User IDs (mỗi dòng 1 ID)</Label>
              <Textarea
                value={(localSettings.blockedUserIds ?? []).join('\n')}
                onChange={(e) => updateBlockedUserIds(e.target.value)}
                placeholder="Nhập các ID cần chặn..."
                rows={4}
                className="rounded-xl border-2 resize-none font-mono text-sm border-[#FF4B4B]/20"
              />
            </div>
          </div>

          {/* Retry & Fetch Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9600] text-white shadow-[0_3px_0_0_#E68600]">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Retry Settings</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình thử lại</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Retries</Label>
                  <Input
                    type="number"
                    value={localSettings.retry?.maxRetries ?? 10}
                    onChange={(e) => updateRetry('maxRetries', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Base Delay (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.retry?.baseDelayMs ?? 1000}
                    onChange={(e) => updateRetry('baseDelayMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1CB0F6] text-white shadow-[0_3px_0_0_#1899D6]">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Fetch Settings</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình request</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.fetch?.timeoutMs ?? 60000}
                    onChange={(e) => updateFetch('timeoutMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Local Retries</Label>
                  <Input
                    type="number"
                    value={localSettings.fetch?.maxRetries ?? 3}
                    onChange={(e) => updateFetch('maxRetries', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logger & Sandbox Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#777777] text-white shadow-[0_3px_0_0_#5A5A5A]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Logger Settings</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình nhật ký</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Lines/File</Label>
                  <Input
                    type="number"
                    value={localSettings.logger?.maxLinesPerFile ?? 1000}
                    onChange={(e) => updateLogger('maxLinesPerFile', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Cache Threshold</Label>
                  <Input
                    type="number"
                    value={localSettings.logger?.logCacheThreshold ?? 1000}
                    onChange={(e) => updateLogger('logCacheThreshold', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF4B4B] text-white shadow-[0_3px_0_0_#E63E3E]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Sandbox</h3>
                  <p className="text-sm text-muted-foreground">Cấu hình môi trường an toàn</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Install Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.sandbox?.installTimeoutMs ?? 60000}
                    onChange={(e) => updateSandbox('installTimeoutMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Execute Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={localSettings.sandbox?.executeTimeoutMs ?? 30000}
                    onChange={(e) => updateSandbox('executeTimeoutMs', Number(e.target.value))}
                    className="h-11 rounded-xl border-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Settings */}
          <div className="rounded-2xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#CE82FF] text-white shadow-[0_3px_0_0_#B86EE6]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Social Settings</h3>
                <p className="text-sm text-muted-foreground">Cấu hình tương tác xã hội</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Reaction Debounce (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.reaction?.debounceMs ?? 2000}
                  onChange={(e) => updateReaction('debounceMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Friend Auto-Accept Min (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.friendRequest?.autoAcceptDelayMinMs ?? 2000}
                  onChange={(e) => updateFriendRequest('autoAcceptDelayMinMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Friend Auto-Accept Max (ms)</Label>
                <Input
                  type="number"
                  value={localSettings.friendRequest?.autoAcceptDelayMaxMs ?? 5000}
                  onChange={(e) => updateFriendRequest('autoAcceptDelayMaxMs', Number(e.target.value))}
                  className="h-11 rounded-xl border-2"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Setting Toggle Component
function SettingToggle({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  color,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border-2 border-transparent hover:border-border transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        style={{ backgroundColor: checked ? color : undefined }}
      />
    </div>
  );
}

// Module descriptions
function getModuleDescription(key: string): string {
  const descriptions: Record<string, string> = {
    system: 'Các lệnh hệ thống cơ bản',
    chat: 'Trò chuyện và hội thoại',
    media: 'Xử lý hình ảnh, video, audio',
    search: 'Tìm kiếm trên internet',
    social: 'Tương tác mạng xã hội',
    task: 'Quản lý công việc và nhắc nhở',
    academic: 'Hỗ trợ học tập',
    entertainment: 'Giải trí và trò chơi',
  };
  return descriptions[key] ?? '';
}
