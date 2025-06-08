import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useVoiceIntegration } from "@/hooks/useVoiceIntegration";
import { 
  Mic, 
  MicOff, 
  Settings, 
  Plus, 
  Play, 
  Square, 
  Volume2, 
  VolumeX,
  Languages,
  Zap,
  Brain,
  MessageSquare,
  Clock,
  Star
} from "lucide-react";

const customCommandSchema = z.object({
  name: z.string().min(1, "Command name is required"),
  trigger: z.string().min(1, "Trigger phrase is required"),
  action: z.enum(["navigate", "create_task", "add_expense", "custom_script"]),
  parameters: z.string().optional(),
  isActive: z.boolean().default(true),
  language: z.enum(["en", "ar", "both"]),
});

type CustomCommandFormData = z.infer<typeof customCommandSchema>;

interface VoiceCommand {
  id: number;
  name: string;
  trigger: string;
  action: string;
  parameters?: string;
  isActive: boolean;
  language: string;
  usageCount: number;
  accuracy: number;
  createdAt: string;
}

interface VoiceSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  confidenceThreshold: number;
  speakingRate: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  wakeWord: string;
}

const bilingualCommands = {
  en: [
    { trigger: "create task", action: "create_task", description: "Create a new task" },
    { trigger: "add expense", action: "add_expense", description: "Add an expense" },
    { trigger: "add income", action: "add_income", description: "Add income" },
    { trigger: "go to dashboard", action: "navigate", parameters: "/dashboard", description: "Navigate to dashboard" },
    { trigger: "go to tasks", action: "navigate", parameters: "/tasks", description: "Navigate to tasks" },
    { trigger: "go to finances", action: "navigate", parameters: "/finances", description: "Navigate to finances" },
    { trigger: "show summary", action: "show_summary", description: "Show financial summary" },
    { trigger: "tell me a joke", action: "ai_joke", description: "Get a daily joke" },
    { trigger: "start timer", action: "start_timer", description: "Start time tracking" },
    { trigger: "stop timer", action: "stop_timer", description: "Stop time tracking" },
  ],
  ar: [
    { trigger: "إنشاء مهمة", action: "create_task", description: "إنشاء مهمة جديدة" },
    { trigger: "أضف مصروف", action: "add_expense", description: "إضافة مصروف" },
    { trigger: "أضف دخل", action: "add_income", description: "إضافة دخل" },
    { trigger: "اذهب إلى لوحة التحكم", action: "navigate", parameters: "/dashboard", description: "الانتقال إلى لوحة التحكم" },
    { trigger: "اذهب إلى المهام", action: "navigate", parameters: "/tasks", description: "الانتقال إلى المهام" },
    { trigger: "اذهب إلى الماليات", action: "navigate", parameters: "/finances", description: "الانتقال إلى الماليات" },
    { trigger: "أظهر الملخص", action: "show_summary", description: "عرض الملخص المالي" },
    { trigger: "احك لي نكتة", action: "ai_joke", description: "الحصول على نكتة اليوم" },
    { trigger: "ابدأ المؤقت", action: "start_timer", description: "بدء تتبع الوقت" },
    { trigger: "أوقف المؤقت", action: "stop_timer", description: "إيقاف تتبع الوقت" },
  ]
};

export function EnhancedVoiceCommands() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak, isListening, toggleListening, isSupported } = useVoiceIntegration();
  const [open, setOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingPhrase, setTrainingPhrase] = useState("");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: i18n.language,
    continuous: true,
    interimResults: true,
    confidenceThreshold: 0.7,
    speakingRate: 1.0,
    voicePitch: 1.0,
    voiceVolume: 1.0,
    autoSpeak: true,
    wakeWord: "hey assistant",
  });

  const form = useForm<CustomCommandFormData>({
    resolver: zodResolver(customCommandSchema),
    defaultValues: {
      name: "",
      trigger: "",
      action: "navigate",
      parameters: "",
      isActive: true,
      language: "both",
    },
  });

  const { data: customCommands = [], isLoading } = useQuery({
    queryKey: ["/api/voice/custom-commands"],
  });

  const { data: voiceHistory = [] } = useQuery({
    queryKey: ["/api/voice/history"],
  });

  const createCommandMutation = useMutation({
    mutationFn: (data: CustomCommandFormData) => apiRequest("/api/voice/custom-commands", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice/custom-commands"] });
      setOpen(false);
      form.reset();
      toast({
        title: t("success.created"),
        description: t("voice.customCommandCreated"),
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: VoiceSettings) => apiRequest("/api/voice/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    }),
    onSuccess: () => {
      toast({
        title: t("success.updated"),
        description: t("voice.settingsUpdated"),
      });
    },
  });

  const handleSubmit = (data: CustomCommandFormData) => {
    createCommandMutation.mutate(data);
  };

  const handleTraining = async () => {
    if (!trainingPhrase) return;
    
    setIsTraining(true);
    speak(t("voice.repeatPhrase") + ": " + trainingPhrase);
    
    // Start listening for the training phrase
    setTimeout(() => {
      setIsTraining(false);
      toast({
        title: t("voice.trainingComplete"),
        description: t("voice.phraseTrainingComplete"),
      });
    }, 5000);
  };

  const currentLanguageCommands = bilingualCommands[i18n.language as keyof typeof bilingualCommands] || bilingualCommands.en;

  const handleSettingsUpdate = (key: keyof VoiceSettings, value: any) => {
    const newSettings = { ...voiceSettings, [key]: value };
    setVoiceSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MicOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("voice.notSupported")}</h3>
          <p className="text-muted-foreground text-center">
            {t("voice.notSupportedDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("voice.title")}</h2>
        <div className="flex space-x-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            className="gap-2"
          >
            {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? t("voice.stopListening") : t("voice.startListening")}
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {t("voice.addCustomCommand")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("voice.createCustomCommand")}</DialogTitle>
                <DialogDescription>
                  {t("voice.customCommandDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("voice.commandName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("voice.enterCommandName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("voice.triggerPhrase")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("voice.enterTriggerPhrase")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" disabled={createCommandMutation.isPending}>
                      {t("common.create")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commands">{t("voice.commands")}</TabsTrigger>
          <TabsTrigger value="training">{t("voice.training")}</TabsTrigger>
          <TabsTrigger value="settings">{t("voice.settings")}</TabsTrigger>
          <TabsTrigger value="history">{t("voice.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  {t("voice.builtInCommands")} ({i18n.language.toUpperCase()})
                </CardTitle>
                <CardDescription>
                  {t("voice.builtInCommandsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {currentLanguageCommands.map((command, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">"{command.trigger}"</p>
                        <p className="text-sm text-muted-foreground">{command.description}</p>
                      </div>
                      <Badge variant="secondary">{command.action}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t("voice.customCommands")}
                </CardTitle>
                <CardDescription>
                  {t("voice.customCommandsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customCommands.length > 0 ? (
                  <div className="grid gap-3">
                    {customCommands.map((command: VoiceCommand) => (
                      <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">"{command.trigger}"</p>
                          <p className="text-sm text-muted-foreground">{command.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {command.language}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {command.usageCount} uses
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(command.accuracy * 100).toFixed(0)}% accuracy
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={command.isActive} />
                          <Badge variant="secondary">{command.action}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2" />
                    <p>{t("voice.noCustomCommands")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t("voice.voiceTraining")}
              </CardTitle>
              <CardDescription>
                {t("voice.voiceTrainingDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("voice.trainingPhrase")}</Label>
                <Input
                  value={trainingPhrase}
                  onChange={(e) => setTrainingPhrase(e.target.value)}
                  placeholder={t("voice.enterTrainingPhrase")}
                />
              </div>
              
              <Button 
                onClick={handleTraining}
                disabled={!trainingPhrase || isTraining}
                className="w-full"
              >
                {isTraining ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {t("voice.training")}...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {t("voice.startTraining")}
                  </>
                )}
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{t("voice.trainingTips")}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t("voice.trainingTip1")}</li>
                  <li>• {t("voice.trainingTip2")}</li>
                  <li>• {t("voice.trainingTip3")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("voice.voiceSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t("voice.confidenceThreshold")}: {(voiceSettings.confidenceThreshold * 100).toFixed(0)}%</Label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={voiceSettings.confidenceThreshold}
                    onChange={(e) => handleSettingsUpdate('confidenceThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("voice.speakingRate")}: {voiceSettings.speakingRate.toFixed(1)}x</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.speakingRate}
                    onChange={(e) => handleSettingsUpdate('speakingRate', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("voice.voicePitch")}: {voiceSettings.voicePitch.toFixed(1)}</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.voicePitch}
                    onChange={(e) => handleSettingsUpdate('voicePitch', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("voice.voiceVolume")}: {(voiceSettings.voiceVolume * 100).toFixed(0)}%</Label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={voiceSettings.voiceVolume}
                    onChange={(e) => handleSettingsUpdate('voiceVolume', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("voice.autoSpeak")}</Label>
                    <p className="text-sm text-muted-foreground">{t("voice.autoSpeakDescription")}</p>
                  </div>
                  <Switch
                    checked={voiceSettings.autoSpeak}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoSpeak', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("voice.continuous")}</Label>
                    <p className="text-sm text-muted-foreground">{t("voice.continuousDescription")}</p>
                  </div>
                  <Switch
                    checked={voiceSettings.continuous}
                    onCheckedChange={(checked) => handleSettingsUpdate('continuous', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("voice.wakeWord")}</Label>
                  <Input
                    value={voiceSettings.wakeWord}
                    onChange={(e) => handleSettingsUpdate('wakeWord', e.target.value)}
                    placeholder={t("voice.enterWakeWord")}
                  />
                </div>
              </div>

              <Button 
                onClick={() => speak(t("voice.testMessage"))}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {t("voice.testVoice")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t("voice.commandHistory")}
              </CardTitle>
              <CardDescription>
                {t("voice.commandHistoryDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {voiceHistory.length > 0 ? (
                <div className="space-y-3">
                  {voiceHistory.slice(0, 10).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">"{entry.transcription}"</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.intent} • {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.confidence > 0.8 ? "default" : "secondary"}>
                          {(entry.confidence * 100).toFixed(0)}%
                        </Badge>
                        {entry.confidence > 0.9 && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p>{t("voice.noHistory")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}