class TencentTTS {
    constructor(wssUrl, voice_id, model_name) {
        this.wssUrl = wssUrl;
        this.socket = null;
        this.sessionId = null;
        this.isConnected = false;
        this.isTaskStarted = false;
        this.isTaskFinished = false;
        this.resolveTaskStarted = null;
        this.resolveTaskFinished = null;
        this.voice_id = voice_id;
        this.model_name = model_name;
    }

    // 连接到 WebSocket 服务并发送 run-task 消息
    async connect(onAudioData, onTaskFinished) {
        return new Promise((resolve, reject) => {
            this.resolveTaskStarted = resolve;
            this.socket = new WebSocket(this.wssUrl);
            this.socket.binaryType = "arraybuffer";

            this.socket.onopen = () => {
                console.log("WebSocket connection established.");
                this.isConnected = true;
            };

            this.socket.onmessage = (event) => {
                const data = event.data;
                if (typeof data === 'string') {
                    const message = JSON.parse(data);
                    console.log("Received message:", message);

                    if (message.code !== 0) {
                        console.error('错误:', message.message);
                        this.isTaskFinished = true;
                        if (typeof onTaskFinished === 'function') {
                            onTaskFinished(); // 调用结束回调
                        }
                        this.resolveTaskFinished?.();

                        this.socket.close();
                        reject(message.message);
                    }

                    if (message.ready === 1) {
                        this.isTaskStarted = true;
                        this.isTaskFinished = false;
                        this.sessionId = message.session_id;
                        console.log('recv task-started');
                        this.resolveTaskStarted?.();
                    }
                    if (message.final === 1) {
                        console.log('recv task-finished');
                        this.isTaskFinished = true;
                        if (typeof onTaskFinished === 'function') {
                            onTaskFinished(); // 调用结束回调
                        }
                        this.resolveTaskFinished?.();
                    }

                    if (message.result?.subtitles) {
                        // console.log('字幕信息:', message.result.subtitles);
                    }
                } else if (data instanceof ArrayBuffer) {
                    // console.log('接收到音频数据 时间:', new Date().toISOString());
                    console.log("recv PCM audio size (bytes): ", data.byteLength);
                    onAudioData(data);
                }
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error); // 如果发生错误，reject Promise
            };

            this.socket.onclose = () => {
                console.log("WebSocket connection closed.");
                this.isConnected = false;
                this.isTaskStarted = false;
                if (!this.isTaskStarted) {
                    reject(new Error("WebSocket closed before task started."));
                }
            };
        });
    }

    // 发送音频数据
    sendText(text_chunk) {
        if (!this.isConnected || !this.isTaskStarted) {
            throw new Error("WebSocket is not connected or task has not started.");
        }
        const continueTaskMessage = {
            session_id: this.sessionId,
            message_id: this.generateUUID(),
            action: 'ACTION_SYNTHESIS',
            data: text_chunk
        };

        this.socket.send(JSON.stringify(continueTaskMessage));
    }

    // 停止任务并等待 task-finished 消息
    stop() {
        if (!this.isConnected || !this.isTaskStarted) {
            throw new Error("WebSocket is not connected or task has not started.");
        }
        const finishTaskMessage = {
            session_id: this.sessionId,
            message_id: this.generateUUID(),
            action: 'ACTION_COMPLETE',
            data: ""
        };

        this.socket.send(JSON.stringify(finishTaskMessage));
        console.log('send message: ', finishTaskMessage)

        return new Promise((resolve, reject) => {
            this.resolveTaskFinished = resolve;
        });
    }

    // 关闭 WebSocket 连接
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // 生成随机 UUID
    generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
// 暴露到全局环境
//window.TencentTTS = TencentTTS;