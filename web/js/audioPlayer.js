// audio_player.js 中的 PCMAudioPlayer 类

class PCMAudioPlayer {
  constructor(sampleRate) {
    this.sampleRate = sampleRate;
    this.audioContext = null;
    this.workletNode = null;
    this.isConnected = false;
    this.dataChunkIndex = 0; // 新增：标记数据批次
  }

  async connect() {
    if (this.isConnected) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      throw new Error('Web Audio API not supported');
    }

    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });

    // 检查 AudioWorklet 支持（无需 SharedArrayBuffer）
    if (!this.audioContext.audioWorklet) {
      throw new Error('AudioWorklet not supported. Please use a modern browser and serve over HTTP.');
    }

    try {
      await this.audioContext.audioWorklet.addModule('./js/pcm-player-worklet.js');

      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-player-worklet');
      this.workletNode.connect(this.audioContext.destination);

      // 👇 监听来自 worklet 的消息
      this.workletNode.port.onmessage = async (event) => {
        if (event.data.type === 'playbackComplete') {
          console.log('✅ All PCM audio has been played.');
          await this.stop();
          sendButton.innerHTML = '<i class="material-icons">send</i>'; // 发送图标
          console.log("_playAudio Done!!!!")
          await start_new_round();
        }
      };

      // 初始化 worklet
      this.workletNode.port.postMessage({
        type: 'init',
        sampleRate: this.sampleRate,
        bufferSize: Math.ceil(this.sampleRate * 2) // 2秒缓冲区
      });

      this.isConnected = true;
      console.log('PCMAudioPlayer connected via AudioWorklet (no SharedArrayBuffer)');
    } catch (e) {
      console.error('Failed to initialize AudioWorklet:', e);
      throw e;
    }
  }

  pushPCM(arrayBuffer) {
    if (!this.isConnected || !this.workletNode) {
      console.warn('Player not connected. Call connect() first.');
      return;
    }
    console.log("pushPCM audio size (bytes): ", arrayBuffer.byteLength);

    const view = new Uint8Array(arrayBuffer);
        const arrayBufferPtr = parent.Module._malloc(arrayBuffer.byteLength);
        parent.Module.HEAPU8.set(view, arrayBufferPtr);
        // console.log("buffer.byteLength", arrayBuffer.byteLength);
        parent.Module._setAudioBuffer(arrayBufferPtr, arrayBuffer.byteLength, this.dataChunkIndex);
        parent.Module._free(arrayBufferPtr);

    this.dataChunkIndex = this.dataChunkIndex + 1;

    // 将 ArrayBuffer 转为 Int16Array（16-bit PCM）
    const int16Data = new Int16Array(arrayBuffer);
    // 通过结构化克隆传递（浏览器会高效处理）
    this.workletNode.port.postMessage({
      type: 'audio',
      data: int16Data
    }, [int16Data.buffer]); // 可选：转移所有权（提高性能）
  }

  sendTtsFinishedMsg() {
      this.workletNode.port.postMessage({
        type: 'task-finished'
      });
  }

  clear() {
    if (this.workletNode) {
      this.workletNode.port.postMessage({ type: 'clear' });
    }
  }

  async stop() {
    this.clear();
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.isConnected = false;
    this.dataChunkIndex = 0; // 停止后重置状态
    console.log('PCMAudioPlayer stopped.');
  }
}

// 暴露到全局环境
window.PCMAudioPlayer = PCMAudioPlayer;