import { useState } from 'react';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import UploadPanel from './components/UploadPanel';
import PreviewPanel from './components/PreviewPanel';
import EditPanel from './components/EditPanel';
import { uploadImage, generateImage, fetchHistory } from './lib/api';
import { buildInitialPrompt, buildEditPrompt } from './lib/prompts';

function App() {
  // Images
  const [modelImage, setModelImage] = useState(null); // { file, preview, url }
  const [outfitImage, setOutfitImage] = useState(null);
  const [currentResult, setCurrentResult] = useState(null); // { imageUrl, ... }
  const [history, setHistory] = useState([]);

  // Edit state
  const [pose, setPose] = useState('');
  const [colorScheme, setColorScheme] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [newOutfitImage, setNewOutfitImage] = useState(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);

  // API Key from localStorage
  const getApiKey = () => localStorage.getItem('banana_api_key') || '';

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Upload handler
  const handleImageSelect = async (file, type) => {
    const preview = URL.createObjectURL(file);
    const setter = type === 'model' ? setModelImage : setOutfitImage;
    setter({ file, preview, url: null });

    try {
      const result = await uploadImage(file);
      setter({ file, preview, url: result.url });
    } catch (err) {
      showToast(`上传失败: ${err.message}`);
      setter(null);
    }
  };

  // Main generate handler
  const handleGenerate = async () => {
    if (!modelImage?.url || !outfitImage?.url) {
      showToast('请先上传模特参考图和搭配参考图');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = buildInitialPrompt({ pose, colorScheme, customInstructions });
      const result = await generateImage({
        prompt,
        modelRefUrl: modelImage.url,
        outfitRefUrl: outfitImage.url,
        pose,
        colorScheme,
        customInstructions,
        apiKey: getApiKey()
      });

      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 12));
      showToast('成片生成成功！', 'success');
    } catch (err) {
      showToast(`生成失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Edit/apply handler
  const handleApplyEdit = async () => {
    if (!currentResult?.imageUrl && !modelImage?.url) {
      showToast('请先生成一张成片');
      return;
    }

    setIsGenerating(true);
    try {
      const outfitUrl = newOutfitImage?.url || outfitImage?.url;
      const editType = newOutfitImage ? 'outfit' : 'modify';
      const prompt = buildEditPrompt({ pose, colorScheme, customInstructions, editType });

      const result = await generateImage({
        prompt,
        modelRefUrl: modelImage?.url,
        outfitRefUrl: outfitUrl,
        previousImageUrl: currentResult?.imageUrl,
        pose,
        colorScheme,
        customInstructions,
        apiKey: getApiKey()
      });

      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 12));
      showToast('修改已应用！', 'success');
    } catch (err) {
      showToast(`修改失败: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!currentResult?.imageUrl) return;
    try {
      const response = await fetch(currentResult.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-model-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('下载失败，请右键图片另存为');
    }
  };

  // Load history on mount
  useState(() => {
    fetchHistory().then(data => {
      if (data && data.length > 0) {
        setHistory(data.map(g => ({ imageUrl: g.result_url, ...g })));
      }
    }).catch(() => { });
  });

  return (
    <div className="app">
      <Header
        isGenerating={isGenerating}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="app-body">
        <UploadPanel
          modelImage={modelImage}
          outfitImage={outfitImage}
          onModelImageSelect={(file) => handleImageSelect(file, 'model')}
          onOutfitImageSelect={(file) => handleImageSelect(file, 'outfit')}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          canGenerate={!!(modelImage?.url && outfitImage?.url)}
        />

        <PreviewPanel
          currentResult={currentResult}
          history={history}
          isGenerating={isGenerating}
          onDownload={handleDownload}
          onHistorySelect={(item) => setCurrentResult(item)}
        />

        <EditPanel
          pose={pose}
          setPose={setPose}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          customInstructions={customInstructions}
          setCustomInstructions={setCustomInstructions}
          newOutfitImage={newOutfitImage}
          onNewOutfitSelect={async (file) => {
            const preview = URL.createObjectURL(file);
            setNewOutfitImage({ file, preview, url: null });
            try {
              const result = await uploadImage(file);
              setNewOutfitImage({ file, preview, url: result.url });
            } catch (err) {
              showToast(`上传失败: ${err.message}`);
              setNewOutfitImage(null);
            }
          }}
          onApply={handleApplyEdit}
          isGenerating={isGenerating}
          hasResult={!!currentResult}
        />
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => showToast('设置已保存', 'success')}
        />
      )}

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'success' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
