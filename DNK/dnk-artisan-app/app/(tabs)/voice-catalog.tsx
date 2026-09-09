import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { HeaderBanner } from '../../components/HeaderBanner';
import { ProductItem, SupportedLanguage, useLanguageStore } from '../../store/useLanguageStore';
import { generateAICatalogFromVoice, generateAICatalogFromText, createProduct } from '../../services/api';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80';

export default function VoiceCatalogScreen() {
    const { t, currentLang, addProduct } = useLanguageStore();
    const router = useRouter();

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [audioRecorded, setAudioRecorded] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [audioFileName, setAudioFileName] = useState('recording.m4a');
    const [audioMimeType, setAudioMimeType] = useState('audio/mp4');

    // Extracted AI Product State
    const [aiExtractedProduct, setAiExtractedProduct] = useState<ProductItem | null>(null);

    // NEW: Edit mode states
    const [editMode, setEditMode] = useState(false);
    const [editableProduct, setEditableProduct] = useState<ProductItem | null>(null);

    // NEW: Audio playback states
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // NEW: Manual text input mode
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
    const [manualText, setManualText] = useState('');

    // Web Camera Video Element Reference
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Animation References
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const wave1 = useRef(new Animated.Value(10)).current;
    const wave2 = useRef(new Animated.Value(18)).current;
    const wave3 = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        if (recording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.25,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            const createWaveAnim = (animVal: Animated.Value, maxH: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(animVal, {
                            toValue: maxH,
                            duration: 250 + Math.random() * 150,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animVal, {
                            toValue: 6,
                            duration: 250 + Math.random() * 150,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                    ])
                );
            };

            const w1 = createWaveAnim(wave1, 28);
            const w2 = createWaveAnim(wave2, 38);
            const w3 = createWaveAnim(wave3, 24);

            w1.start();
            w2.start();
            w3.start();
        } else {
            pulseAnim.setValue(1);
            wave1.setValue(10);
            wave2.setValue(18);
            wave3.setValue(12);
        }
    }, [recording]);

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            stopCameraStream();
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    // When AI generates product, set editable copy
    useEffect(() => {
        if (aiExtractedProduct) {
            setEditableProduct({...aiExtractedProduct});
            setEditMode(false);
        }
    }, [aiExtractedProduct]);

    const stopCameraStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const resetForm = () => {
        setRecording(null);
        setAudioRecorded(false);
        setAudioUri(null);
        setAudioFileName('recording.m4a');
        setAudioMimeType('audio/mp4');
        setImageUri(null);
        setAiExtractedProduct(null);
        setEditableProduct(null);
        setEditMode(false);
        setManualText('');
        setInputMode('voice');
        if (sound) {
            sound.unloadAsync();
            setSound(null);
        }
        setIsPlayingAudio(false);
        stopCameraStream();
    };

    const discardPhoto = (e?: any) => {
        e?.stopPropagation?.();
        stopCameraStream();
        setImageUri(null);
    };

    const getBase64FromUri = async (uri: string): Promise<string | null> => {
        try {
            if (uri.startsWith('data:')) {
                return uri;
            }
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(blob);
                });
            }
        } catch (e) {
            console.warn('Error reading image base64:', e);
        }
        return null;
    };

    // NEW: Play recording function
    const playRecording = async () => {
        if (!audioUri) {
            alert("No recording to play.");
            return;
        }

        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlayingAudio(false);
                return;
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlayingAudio(true);

            newSound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.didJustFinish) {
                    setIsPlayingAudio(false);
                    setSound(null);
                }
            });
        } catch (e) {
            console.error("Playback failed:", e);
            alert("Could not play the recording.");
        }
    };

    // NEW: Validate audio before sending
    const validateAudio = async (uri: string): Promise<boolean> => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            if (blob.size < 1000) { // Less than 1KB likely empty
                alert("Your recording seems empty. Please record again with clear audio.");
                return false;
            }
            return true;
        } catch (e) {
            console.warn("Could not check audio size:", e);
            return true; // Proceed if can't check
        }
    };

    const sendToAiEngine = async () => {
        setIsProcessing(true);
        let finalImage = imageUri || DEFAULT_FALLBACK_IMAGE;

        // VALIDATE: Check if we have either audio or image or text
        if (!audioUri && !audioRecorded && !imageUri && !manualText.trim()) {
            alert("Please record your voice, enter text description, or capture a product photo before generating.");
            setIsProcessing(false);
            return;
        }

        try {
            let aiRes: any;
            let imageBase64: string | undefined = undefined;

            if (imageUri) {
                const b64 = await getBase64FromUri(imageUri);
                if (b64) {
                    imageBase64 = b64;
                }
            }

            // Handle manual text input first
            if (inputMode === 'text' && manualText.trim()) {
                if (manualText.trim().length < 10) {
                    alert("Please provide a more detailed description (at least 10 characters).");
                    setIsProcessing(false);
                    return;
                }

                const promptText = manualText.trim();
                aiRes = await generateAICatalogFromText(promptText, currentLang, imageBase64);
            }
            // Handle voice input
            else if (audioUri || audioRecorded) {
                if (!audioUri) {
                    alert("Please record your voice first.");
                    setIsProcessing(false);
                    return;
                }

                // Validate audio before sending
                const isValid = await validateAudio(audioUri);
                if (!isValid) {
                    setIsProcessing(false);
                    return;
                }

                const formData = new FormData();

                if (Platform.OS === 'web') {
                    try {
                        console.log("Audio URI:", audioUri);
                        const audioResponse = await fetch(audioUri);
                        const audioBlob = await audioResponse.blob();
                        console.log("Audio blob size:", audioBlob.size);

                        if (audioBlob.size === 0) {
                            alert("The recording is empty. Please record again.");
                            setIsProcessing(false);
                            return;
                        }

                        formData.append('file', audioBlob, 'recording.webm');
                    } catch (e) {
                        console.error("Audio upload failed:", e);
                        alert("Could not read the recording. Please record again.");
                        setIsProcessing(false);
                        return;
                    }
                } else {
                    formData.append('file', {
                        uri: audioUri,
                        name: audioFileName,
                        type: audioMimeType,
                    } as any);
                }

                if (imageBase64) {
                    formData.append('image_base64', imageBase64);
                    formData.append('image_mime_type', 'image/jpeg');
                }

                aiRes = await generateAICatalogFromVoice(formData);

                if (!imageUri) {
                    try {
                        const productText =
                            aiRes.product_title_en ||
                            aiRes.transcript ||
                            aiRes.category ||
                            'Indian handicraft';

                        const pexelsResponse = await fetch(
                            `http://localhost:8000/api/pexels/search?query=${encodeURIComponent(productText)}`
                        );

                        if (pexelsResponse.ok) {
                            const pexelsData = await pexelsResponse.json();
                            if (pexelsData.image?.image_url) {
                                finalImage = pexelsData.image.image_url;
                                console.log('Pexels image selected:', finalImage);
                            }
                        }
                    } catch (error) {
                        console.warn('Pexels image search failed:', error);
                    }
                }
            } else if (imageBase64) {
                const promptText = 'Handcrafted Indian Artisan Product export ready';
                aiRes = await generateAICatalogFromText(promptText, currentLang, imageBase64);
            } else {
                throw new Error('Please provide voice input, text description, or capture a product photo first.');
            }

            // Check if AI returned a valid product or if it's hallucinating
            const titleEn = aiRes.product_title_en || 'Handcrafted Indian Artisan Product';
            const descEn = aiRes.product_description_en || 'Export certified handicraft product.';

            // Check for hallucination indicators (backend already handles this, but double-check here)
            if (titleEn === 'Handcrafted Indian Artisan Product' &&
                (descEn.includes('could not be confirmed') || descEn.includes('pending'))) {
                Alert.alert(
                    'Incomplete Product Details',
                    'The AI could not clearly identify your product. Please provide a more detailed description or clearer audio/photo.',
                    [
                        { text: 'Try Again', onPress: resetForm },
                        { text: 'Edit Manually', onPress: () => {
                            // Create minimal product for manual editing
                            const newExtractedItem: ProductItem = {
                                id: `prod_${Date.now()}`,
                                title: {
                                    en: titleEn,
                                    hi: titleEn,
                                    kn: titleEn,
                                    te: titleEn,
                                    ta: titleEn,
                                    ml: titleEn,
                                    mr: titleEn,
                                    bn: titleEn,
                                },
                                description: {
                                    en: descEn,
                                    hi: descEn,
                                    kn: descEn,
                                    te: descEn,
                                    ta: descEn,
                                    ml: descEn,
                                    mr: descEn,
                                    bn: descEn,
                                },
                                category: 'Needs Manual Review',
                                hsCode: 'UNKNOWN',
                                weight: '500g',
                                priceInr: 0,
                                imageUri: finalImage,
                                status: 'ACTIVE_EXPORT',
                            };
                            setAiExtractedProduct(newExtractedItem);
                            setEditMode(true);
                        }}
                    ]
                );
                setIsProcessing(false);
                return;
            }

            const newExtractedItem: ProductItem = {
                id: `prod_${Date.now()}`,
                title: {
                    en: titleEn,
                    hi: aiRes.translated_title_local || titleEn,
                    kn: titleEn,
                    te: titleEn,
                    ta: titleEn,
                    ml: titleEn,
                    mr: titleEn,
                    bn: titleEn,
                },
                description: {
                    en: descEn,
                    hi: descEn,
                    kn: descEn,
                    te: descEn,
                    ta: descEn,
                    ml: descEn,
                    mr: descEn,
                    bn: descEn,
                },
                category: aiRes.category || 'Handicrafts & Collectibles',
                hsCode: aiRes.hs_code || '9503.00.00',
                weight: aiRes.estimated_weight || aiRes.weight || '500g',
                priceInr: aiRes.estimated_price_inr || aiRes.price_inr || 1200,
                imageUri: finalImage,
                status: 'ACTIVE_EXPORT',
            };

            setAiExtractedProduct(newExtractedItem);
        } catch (err: any) {
            const errorMsg = err.message || 'AI Engine processing failed. Please check connection.';
            if (Platform.OS === 'web') {
                window.alert(`AI Intake Error: ${errorMsg}`);
            } else {
                Alert.alert('AI Intake Error', errorMsg);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmAndSave = async () => {
        // Use editableProduct if in edit mode, otherwise use aiExtractedProduct
        const productToSave = editMode ? editableProduct : aiExtractedProduct;

        if (!productToSave) {
            alert("No product to save.");
            return;
        }

        setIsProcessing(true);
        try {
            const titleText = productToSave.title.en || productToSave.title[currentLang] || 'Handcrafted Export Product';
            const descText = productToSave.description.en || productToSave.description[currentLang] || '';

            await createProduct({
                title: titleText,
                description: descText,
                price_inr: productToSave.priceInr || 1850,
                hs_code: productToSave.hsCode,
                hs_confidence: 0.95,
                image_urls: [productToSave.imageUri],
            });

            const res = addProduct(productToSave);
            if (!res.success) {
                const errorMsg = res.error || t('duplicate_error');
                if (Platform.OS === 'web') {
                    window.alert(errorMsg);
                } else {
                    Alert.alert('Duplicate Item', errorMsg);
                }
                return;
            }

            resetForm();
            router.push('/(tabs)/products' as any);
        } catch (err: any) {
            const msg = err.message || 'Failed to save product to backend database.';
            if (Platform.OS === 'web') {
                window.alert(`Save Error: ${msg}`);
            } else {
                Alert.alert('Save Error', msg);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAudioUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const file = result.assets[0];
            const name = file.name || 'recording.m4a';
            const mimeType =
                file.mimeType ||
                (name.toLowerCase().endsWith('.mp3')
                    ? 'audio/mpeg'
                    : name.toLowerCase().endsWith('.wav')
                      ? 'audio/wav'
                      : name.toLowerCase().endsWith('.webm')
                        ? 'audio/webm'
                        : 'audio/mp4');

            setAudioUri(file.uri);
            setAudioFileName(name);
            setAudioMimeType(mimeType);
            setAudioRecorded(true);
        } catch (error) {
            console.error('Audio upload failed:', error);
            alert('Could not upload the audio file.');
        }
    };

    const handleVoiceRecording = async () => {
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();

                if (!uri) {
                    alert("Recording failed. Please try again.");
                    return;
                }

                setAudioUri(uri);
                setAudioFileName('recording.webm');
                setAudioMimeType('audio/webm');
                setAudioRecorded(true);
            } catch (e) {
                console.error("Stopping recording failed:", e);
                alert("Could not save the recording.");
            } finally {
                setRecording(null);
            }
        } else {
            try {
                const permission = await Audio.requestPermissionsAsync();

                if (!permission.granted) {
                    alert("Microphone permission is required.");
                    return;
                }

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording: newRecording } =
                    await Audio.Recording.createAsync(
                        Audio.RecordingOptionsPresets.HIGH_QUALITY
                    );

                setRecording(newRecording);
                setAudioRecorded(false);
                setAudioUri(null);
            } catch (e) {
                console.error("Starting recording failed:", e);
                alert("Could not start recording.");
            }
        }
    };

    const openCamera = async () => {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                setIsCameraActive(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                window.alert('Please allow camera permissions in your browser to take a photo.');
            }
        } else {
            try {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert('Permission Denied', 'Camera permission is required.');
                    return;
                }
                const result = await ImagePicker.launchCameraAsync({
                    quality: 0.8,
                    allowsEditing: true,
                    aspect: [4, 3],
                });
                if (!result.canceled && result.assets && result.assets[0]?.uri) {
                    setImageUri(result.assets[0].uri);
                }
            } catch (e) { }
        }
    };

    const captureWebSnapshot = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setImageUri(dataUrl);
                stopCameraStream();
            }
        }
    };

    const openGallery = async () => {
        stopCameraStream();
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                quality: 0.8,
                allowsEditing: true,
                aspect: [4, 3],
                base64: true,
            });
            if (!result.canceled && result.assets && result.assets[0]?.uri) {
                if (result.assets[0].base64) {
                    setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
                } else {
                    setImageUri(result.assets[0].uri);
                }
            }
        } catch (e) { }
    };

    return (
        <View style={styles.container}>
            <HeaderBanner userInitials="KA" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainHeading}>{t('module_a_title')}</Text>
                    <Text style={styles.subHeading}>{t('module_a_sub')}</Text>
                </View>

                {!aiExtractedProduct ? (
                    <View style={styles.formWrapper}>
                        {/* Input Mode Selector */}
                        <View style={styles.inputModeSelector}>
                            <TouchableOpacity
                                onPress={() => setInputMode('voice')}
                                style={[styles.modeBtn, inputMode === 'voice' && styles.modeBtnActive]}
                            >
                                <Text style={[styles.modeBtnText, inputMode === 'voice' && styles.modeBtnTextActive]}>🎙️ Voice</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setInputMode('text')}
                                style={[styles.modeBtn, inputMode === 'text' && styles.modeBtnActive]}
                            >
                                <Text style={[styles.modeBtnText, inputMode === 'text' && styles.modeBtnTextActive]}>⌨️ Type</Text>
                            </TouchableOpacity>
                        </View>

                        {inputMode === 'text' ? (
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    style={styles.manualTextInput}
                                    placeholder="Describe your product in English or Hindi..."
                                    value={manualText}
                                    onChangeText={setManualText}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text style={styles.charCount}>
                                    {manualText.length} characters {manualText.length < 10 && '(min 10)'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.sideBySideRow}>
                                {/* VOICE RECORDER */}
                                <View style={styles.sideColumn}>
                                    <View style={styles.micBoxContainer}>
                                        <Animated.View
                                            style={[
                                                styles.pulseRing,
                                                recording ? styles.pulseRingActive : styles.pulseRingInactive,
                                                { transform: [{ scale: pulseAnim }] }
                                            ]}
                                        />

                                        <TouchableOpacity
                                            onPress={handleVoiceRecording}
                                            style={[styles.micBtn, recording ? styles.micBtnActive : styles.micBtnInactive]}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.micIcon}>{recording ? '⏹' : '🎙'}</Text>
                                            <Text style={styles.micText}>
                                                {recording ? t('stop_mic') : (audioRecorded ? t('voice_done') : t('mic_instruction'))}
                                            </Text>
                                        </TouchableOpacity>

                                        {recording && (
                                            <View style={styles.waveformContainer}>
                                                <Animated.View style={[styles.waveBar, { height: wave1 }]} />
                                                <Animated.View style={[styles.waveBar, { height: wave2 }]} />
                                                <Animated.View style={[styles.waveBar, { height: wave3 }]} />
                                            </View>
                                        )}
                                    </View>

                                    {/* Audio Playback Controls */}
                                    {audioRecorded && audioUri && (
                                        <View style={styles.audioControls}>
                                            <TouchableOpacity onPress={playRecording} style={styles.playBtn}>
                                                <Text style={styles.playBtnText}>
                                                    {isPlayingAudio ? '⏹️ Stop' : '▶️ Play Recording'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => {
                                                setAudioUri(null);
                                                setAudioRecorded(false);
                                                if (sound) {
                                                    sound.unloadAsync();
                                                    setSound(null);
                                                }
                                                setIsPlayingAudio(false);
                                            }} style={styles.deleteAudioBtn}>
                                                <Text style={styles.deleteAudioText}>🗑️ Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* PHOTO UPLOAD / CAMERA */}
                                <View style={styles.sideColumn}>
                                    <View style={styles.photoBox}>
                                        {isCameraActive ? (
                                            <View style={styles.cameraLiveContainer}>
                                                {Platform.OS === 'web' && (
                                                    <video
                                                        ref={(el) => {
                                                            videoRef.current = el;
                                                            if (el && streamRef.current && el.srcObject !== streamRef.current) {
                                                                el.srcObject = streamRef.current;
                                                                el.play().catch(() => { });
                                                            }
                                                        }}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                    />
                                                )}
                                                <View style={styles.cameraControlsRow}>
                                                    <TouchableOpacity onPress={captureWebSnapshot} style={styles.snapBtn}>
                                                        <Text style={styles.snapBtnText}>📸 Snap Photo</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={stopCameraStream} style={styles.cancelCameraBtn}>
                                                        <Text style={styles.cancelCameraText}>✕ Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : imageUri ? (
                                            <View style={styles.imagePreviewContainer}>
                                                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />

                                                <View style={styles.photoActionOverlay}>
                                                    <TouchableOpacity onPress={openCamera} style={styles.changePhotoBtn} activeOpacity={0.8}>
                                                        <Text style={styles.changePhotoText}>📸 Camera</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={openGallery} style={styles.changePhotoBtn} activeOpacity={0.8}>
                                                        <Text style={styles.changePhotoText}>🖼️ Gallery</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={discardPhoto} style={styles.discardPhotoBtn} activeOpacity={0.8}>
                                                        <Text style={styles.discardPhotoText}>{t('discard_photo')}</Text>
                                                    </TouchableOpacity>
                                                </View>

                                                <View style={styles.successBadge}>
                                                    <Text style={styles.successBadgeText}>{t('photo_captured')}</Text>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={styles.photoPlaceholder}>
                                                <View style={styles.btnRow}>
                                                    <TouchableOpacity onPress={openCamera} style={styles.actionBtnCircle} activeOpacity={0.8}>
                                                        <Text style={styles.photoIcon}>📸</Text>
                                                        <Text style={styles.btnLabel}>Take Photo</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={openGallery} style={styles.actionBtnCircle} activeOpacity={0.8}>
                                                        <Text style={styles.photoIcon}>🖼️</Text>
                                                        <Text style={styles.btnLabel}>Upload Image</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={handleAudioUpload} style={styles.actionBtnCircle} activeOpacity={0.8}>
                                                        <Text style={styles.photoIcon}>🎵</Text>
                                                        <Text style={styles.btnLabel}>Upload Audio</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <Text style={styles.photoSubText}>Capture photo, upload image, or upload audio</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={sendToAiEngine}
                            disabled={isProcessing}
                            style={[styles.submitBtn, styles.activeBtn]}
                        >
                            {isProcessing ? (
                                <View style={styles.processingRow}>
                                    <ActivityIndicator color="#FFFFFF" />
                                    <Text style={styles.processingText}>{t('processing_ai')}</Text>
                                </View>
                            ) : (
                                <Text style={styles.submitBtnText}>⚡ {inputMode === 'text' ? 'Generate from Text' : t('generate_catalog')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewBadge}>AI EXTRACTED CATALOG</Text>
                            <View style={styles.editHeaderRow}>
                                <Text style={styles.previewTitle}>Review & Edit Product Details</Text>
                                <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.editToggle}>
                                    <Text style={styles.editToggleText}>{editMode ? '👁️ View' : '✏️ Edit'}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.previewSub}>Edit any field before confirming</Text>
                        </View>

                        <Image source={{ uri: editableProduct?.imageUri || aiExtractedProduct.imageUri }} style={styles.cardImage} resizeMode="cover" />

                        <View style={styles.cardInfo}>
                            {/* Title - Editable */}
                            <Text style={styles.fieldLabel}>Title:</Text>
                            {editMode ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={editableProduct?.title.en || ''}
                                    onChangeText={(text) => setEditableProduct(prev =>
                                        prev ? {...prev, title: {...prev.title, en: text}} : null
                                    )}
                                    placeholder="Enter product title"
                                    placeholderTextColor="#9CA3AF"
                                />
                            ) : (
                                <Text style={styles.fieldValueTitle}>
                                    {editableProduct?.title[currentLang as SupportedLanguage] || editableProduct?.title['en']}
                                </Text>
                            )}

                            {/* Description - Editable */}
                            <Text style={styles.fieldLabel}>Description:</Text>
                            {editMode ? (
                                <TextInput
                                    style={[styles.editInput, styles.textArea]}
                                    value={editableProduct?.description.en || ''}
                                    onChangeText={(text) => setEditableProduct(prev =>
                                        prev ? {...prev, description: {...prev.description, en: text}} : null
                                    )}
                                    placeholder="Enter product description"
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#9CA3AF"
                                />
                            ) : (
                                <Text style={styles.fieldValueDesc}>
                                    {editableProduct?.description[currentLang as SupportedLanguage] || editableProduct?.description['en']}
                                </Text>
                            )}

                            {/* Category - Editable */}
                            <Text style={styles.fieldLabel}>Category:</Text>
                            {editMode ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={editableProduct?.category || ''}
                                    onChangeText={(text) => setEditableProduct(prev =>
                                        prev ? {...prev, category: text} : null
                                    )}
                                    placeholder="Enter category"
                                    placeholderTextColor="#9CA3AF"
                                />
                            ) : (
                                <Text style={styles.fieldValueTitle}>{editableProduct?.category}</Text>
                            )}

                            {/* Meta Fields - Editable */}
                            <View style={styles.metaRow}>
                                <View style={styles.metaBox}>
                                    <Text style={styles.metaLabel}>HS Code</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.editInputSmall}
                                            value={editableProduct?.hsCode || ''}
                                            onChangeText={(text) => setEditableProduct(prev =>
                                                prev ? {...prev, hsCode: text} : null
                                            )}
                                            placeholder="HS Code"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    ) : (
                                        <Text style={styles.metaValueHs}>{editableProduct?.hsCode}</Text>
                                    )}
                                </View>

                                <View style={styles.metaBox}>
                                    <Text style={styles.metaLabel}>Weight</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.editInputSmall}
                                            value={editableProduct?.weight || ''}
                                            onChangeText={(text) => setEditableProduct(prev =>
                                                prev ? {...prev, weight: text} : null
                                            )}
                                            placeholder="Weight"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    ) : (
                                        <Text style={styles.metaValue}>{editableProduct?.weight}</Text>
                                    )}
                                </View>

                                <View style={styles.metaBox}>
                                    <Text style={styles.metaLabel}>Price (₹)</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.editInputSmall}
                                            value={String(editableProduct?.priceInr || '')}
                                            onChangeText={(text) => setEditableProduct(prev =>
                                                prev ? {...prev, priceInr: Number(text) || 0} : null
                                            )}
                                            keyboardType="numeric"
                                            placeholder="Price"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    ) : (
                                        <Text style={styles.metaValuePrice}>₹{editableProduct?.priceInr}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Buttons */}
                            <TouchableOpacity
                                onPress={handleConfirmAndSave}
                                style={styles.confirmBtn}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <View style={styles.processingRow}>
                                        <ActivityIndicator color="#FFFFFF" />
                                        <Text style={styles.confirmBtnText}>Saving...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.confirmBtnText}>
                                        {editMode ? '✅ Confirm & Save' : '✅ Confirm & Add to Products'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>🔄 {editMode ? 'Discard Changes' : 'Try Again'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F7' },
    scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 40 },
    titleContainer: { alignItems: 'center', marginBottom: 20 },
    mainHeading: { fontSize: 24, fontWeight: '900', color: '#1F2937', textAlign: 'center' },
    subHeading: { fontSize: 13, color: '#4B5563', textAlign: 'center', marginTop: 4 },
    formWrapper: { width: '100%', maxWidth: 900 },

    // Input Mode Selector
    inputModeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
    },
    modeBtn: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    modeBtnActive: {
        backgroundColor: '#0B7B3E',
        borderColor: '#0B7B3E',
    },
    modeBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
    modeBtnTextActive: { color: '#FFFFFF' },

    // Text Input
    textInputContainer: {
        marginVertical: 10,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    manualTextInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        textAlignVertical: 'top',
        color: '#1F2937',
    },
    charCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
        textAlign: 'right',
    },

    sideBySideRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 16,
        marginBottom: 20,
        minHeight: 250,
    },
    sideColumn: {
        flex: 1,
        height: 250,
    },
    micBoxContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    pulseRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
    pulseRingInactive: { backgroundColor: 'rgba(11, 123, 62, 0.15)' },
    pulseRingActive: { backgroundColor: 'rgba(139, 34, 34, 0.25)' },
    micBtn: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        padding: 10
    },
    micBtnInactive: { backgroundColor: '#0B7B3E', borderColor: '#A7F3D0' },
    micBtnActive: { backgroundColor: '#8B2222', borderColor: '#FCA5A5' },
    micIcon: { fontSize: 32 },
    micText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 4 },
    waveformContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, position: 'absolute', bottom: 12 },
    waveBar: { width: 4, backgroundColor: '#8B2222', marginHorizontal: 2, borderRadius: 2 },

    // Audio Controls
    audioControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
    },
    playBtn: {
        backgroundColor: '#1E40AF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    playBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    deleteAudioBtn: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    deleteAudioText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

    photoBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0B7B3E',
        borderStyle: 'dashed',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    cameraLiveContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000000',
    },
    cameraControlsRow: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    snapBtn: {
        backgroundColor: '#0B7B3E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    snapBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
    },
    cancelCameraBtn: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    cancelCameraText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 12,
    },
    photoPlaceholder: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12
    },
    btnRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    actionBtnCircle: {
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        minWidth: 80,
    },
    photoIcon: { fontSize: 24 },
    btnLabel: { fontSize: 10, fontWeight: '800', color: '#166534', marginTop: 4 },
    photoSubText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
    imagePreviewContainer: { width: '100%', height: '100%', position: 'relative' },
    previewImage: { width: '100%', height: '100%' },
    photoActionOverlay: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    changePhotoBtn: {
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    changePhotoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    discardPhotoBtn: {
        backgroundColor: 'rgba(220, 38, 38, 0.85)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    discardPhotoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    successBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#0B7B3E',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    successBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

    submitBtn: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activeBtn: { backgroundColor: '#0B7B3E' },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    processingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    processingText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    previewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 500,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    previewHeader: { padding: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderColor: '#F3F4F6' },
    previewBadge: { fontSize: 10, fontWeight: '800', color: '#0B7B3E', letterSpacing: 0.5 },
    editHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    previewTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    previewSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    editToggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
    },
    editToggleText: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
    cardImage: { width: '100%', height: 220 },
    cardInfo: { padding: 16 },
    fieldLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginTop: 10, textTransform: 'uppercase' },
    fieldValueTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginTop: 2 },
    fieldValueDesc: { fontSize: 13, color: '#4B5563', marginTop: 2, lineHeight: 18 },
    editInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        padding: 8,
        marginVertical: 4,
        backgroundColor: '#F9FAFB',
        fontSize: 14,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    editInputSmall: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        padding: 4,
        marginVertical: 2,
        backgroundColor: '#F9FAFB',
        fontSize: 12,
        textAlign: 'center',
        width: '100%',
        color: '#1F2937',
    },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 16, marginBottom: 20 },
    metaBox: { flex: 1, backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, alignItems: 'center' },
    metaLabel: { fontSize: 10, color: '#6B7280', fontWeight: '700' },
    metaValue: { fontSize: 12, fontWeight: '700', color: '#1F2937', marginTop: 2 },
    metaValueHs: { fontSize: 12, fontWeight: '800', color: '#1E40AF', marginTop: 2 },
    metaValuePrice: { fontSize: 13, fontWeight: '900', color: '#059669', marginTop: 2 },
    confirmBtn: { backgroundColor: '#0B7B3E', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
    confirmBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    cancelBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    cancelBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 13 },
});
