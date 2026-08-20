import { Audio } from 'expo-av';

import * as ImagePicker from 'expo-image-picker';

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



    // Extracted AI Product State

    const [aiExtractedProduct, setAiExtractedProduct] = useState<ProductItem | null>(null);



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

        };

    }, []);



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

        setImageUri(null);

        setAiExtractedProduct(null);

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

    const sendToAiEngine = async () => {
        setIsProcessing(true);
        const finalImage = imageUri || DEFAULT_FALLBACK_IMAGE;

        try {
            let aiRes: any;
            const audioUri = recording ? recording.getURI() : null;
            let imageBase64: string | undefined = undefined;

            if (imageUri) {
                const b64 = await getBase64FromUri(imageUri);
                if (b64) {
                    imageBase64 = b64;
                }
            }

            if (audioUri || audioRecorded) {
                const formData = new FormData();
                if (Platform.OS === 'web' && audioUri) {
                    try {
                        const response = await fetch(audioUri);
                        const blob = await response.blob();
                        formData.append('file', blob, 'recording.webm');
                    } catch (_) {
                        formData.append('file', new Blob(['sample audio'], { type: 'audio/mpeg' }), 'sample.mp3');
                    }
                } else if (audioUri) {
                    formData.append('file', {
                        uri: audioUri,
                        name: 'recording.m4a',
                        type: 'audio/m4a',
                    } as any);
                } else {
                    formData.append('file', new Blob(['sample audio'], { type: 'audio/mpeg' }), 'sample.mp3');
                }

                if (imageBase64) {
                    formData.append('image_base64', imageBase64);
                    formData.append('image_mime_type', 'image/jpeg');
                }

                aiRes = await generateAICatalogFromVoice(formData);
            } else if (imageBase64) {
                const promptText = 'Handcrafted Indian Artisan Product export ready';
                aiRes = await generateAICatalogFromText(promptText, currentLang, imageBase64);
            } else {
                throw new Error('Please capture a product photo or record a voice note first.');
            }

            const titleEn = aiRes.product_title_en || 'Handcrafted Indian Artisan Product';
            const descEn = aiRes.product_description_en || 'Export certified handicraft product.';

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

        if (aiExtractedProduct) {

            setIsProcessing(true);

            try {

                const titleText = aiExtractedProduct.title.en || aiExtractedProduct.title[currentLang] || 'Handcrafted Export Product';

                const descText = aiExtractedProduct.description.en || aiExtractedProduct.description[currentLang] || '';



                await createProduct({

                    title: titleText,

                    description: descText,

                    price_inr: aiExtractedProduct.priceInr || 1850,

                    hs_code: aiExtractedProduct.hsCode,

                    hs_confidence: 0.95,

                    image_urls: [aiExtractedProduct.imageUri],

                });



                const res = addProduct(aiExtractedProduct);

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

        }

    };



    const handleVoiceRecording = async () => {

        if (recording) {

            setRecording(null);

            setAudioRecorded(true);

            try {

                await recording.stopAndUnloadAsync();

            } catch (e) { }

        } else {

            try {

                await Audio.requestPermissionsAsync();

                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

                const { recording: newRecording } = await Audio.Recording.createAsync(

                    Audio.RecordingOptionsPresets.HIGH_QUALITY

                );

                setRecording(newRecording);

            } catch (e) {

                setRecording({} as any);

            }

        }

    };



    // Open Direct Camera (Web Webcam Stream / Native Mobile Camera)

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



    // Capture frame from active web camera stream

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



    // Gallery File Picker
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

                        {/* SIDE-BY-SIDE SECTION */}

                        <View style={styles.sideBySideRow}>



                            {/* LEFT: VOICE RECORDER */}

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

                            </View>



                            {/* RIGHT: PHOTO UPLOAD BOX / LIVE CAMERA */}

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



                                            {/* OVERLAY ACTIONS */}

                                            <View style={styles.photoActionOverlay}>

                                                <TouchableOpacity

                                                    onPress={openCamera}

                                                    style={styles.changePhotoBtn}

                                                    activeOpacity={0.8}

                                                >

                                                    <Text style={styles.changePhotoText}>📸 Camera</Text>

                                                </TouchableOpacity>



                                                <TouchableOpacity

                                                    onPress={openGallery}

                                                    style={styles.changePhotoBtn}

                                                    activeOpacity={0.8}

                                                >

                                                    <Text style={styles.changePhotoText}>🖼️ Gallery</Text>

                                                </TouchableOpacity>



                                                <TouchableOpacity

                                                    onPress={discardPhoto}

                                                    style={styles.discardPhotoBtn}

                                                    activeOpacity={0.8}

                                                >

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

                                                    <Text style={styles.btnLabel}>Upload File</Text>

                                                </TouchableOpacity>

                                            </View>

                                            <Text style={styles.photoSubText}>Capture with camera or upload image</Text>

                                        </View>

                                    )}

                                </View>

                            </View>



                        </View>



                        {/* GENERATE BUTTON */}

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

                                <Text style={styles.submitBtnText}>⚡ {t('generate_catalog')}</Text>

                            )}

                        </TouchableOpacity>

                    </View>

                ) : (

                    /* AI EXTRACTED PREVIEW */

                    <View style={styles.previewCard}>

                        <View style={styles.previewHeader}>

                            <Text style={styles.previewBadge}>AI EXTRACTED CATALOG</Text>

                            <Text style={styles.previewTitle}>{t('ai_preview_title')}</Text>

                            <Text style={styles.previewSub}>{t('ai_preview_sub')}</Text>

                        </View>



                        <Image source={{ uri: aiExtractedProduct.imageUri }} style={styles.cardImage} resizeMode="cover" />



                        <View style={styles.cardInfo}>

                            <Text style={styles.fieldLabel}>{t('prod_name_label')}:</Text>

                            <Text style={styles.fieldValueTitle}>

                                {aiExtractedProduct.title[currentLang as SupportedLanguage] || aiExtractedProduct.title['en']}

                            </Text>



                            <Text style={styles.fieldLabel}>{t('prod_desc_label')}:</Text>

                            <Text style={styles.fieldValueDesc}>

                                {aiExtractedProduct.description[currentLang as SupportedLanguage] || aiExtractedProduct.description['en']}

                            </Text>



                            <View style={styles.metaRow}>

                                <View style={styles.metaBox}>

                                    <Text style={styles.metaLabel}>{t('hs_code_label')}</Text>

                                    <Text style={styles.metaValueHs}>{aiExtractedProduct.hsCode}</Text>

                                </View>

                                <View style={styles.metaBox}>

                                    <Text style={styles.metaLabel}>{t('weight_label')}</Text>

                                    <Text style={styles.metaValue}>{aiExtractedProduct.weight}</Text>

                                </View>

                                <View style={styles.metaBox}>

                                    <Text style={styles.metaLabel}>{t('est_price_label')}</Text>

                                    <Text style={styles.metaValuePrice}>₹{aiExtractedProduct.priceInr}</Text>

                                </View>

                            </View>



                            <TouchableOpacity

                                onPress={handleConfirmAndSave}

                                style={styles.confirmBtn}

                            >

                                <Text style={styles.confirmBtnText}>{t('btn_confirm_add')}</Text>

                            </TouchableOpacity>



                            <TouchableOpacity

                                onPress={resetForm}

                                style={styles.cancelBtn}

                            >

                                <Text style={styles.cancelBtnText}>{t('btn_cancel')}</Text>

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

        top: 8,

        left: 8,

        right: 8,

        flexDirection: 'row',

        justifyContent: 'space-between',

        zIndex: 10,

        gap: 6,

    },

    changePhotoBtn: {

        backgroundColor: 'rgba(17, 24, 39, 0.8)',

        paddingHorizontal: 8,

        paddingVertical: 5,

        borderRadius: 6,

    },

    changePhotoText: {

        color: '#FFFFFF',

        fontSize: 10,

        fontWeight: '800',

    },

    discardPhotoBtn: {

        backgroundColor: 'rgba(220, 38, 38, 0.85)',

        paddingHorizontal: 8,

        paddingVertical: 5,

        borderRadius: 6,

    },

    discardPhotoText: {

        color: '#FFFFFF',

        fontSize: 10,

        fontWeight: '800',

    },



    successBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: '#0B7B3E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },

    successBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },



    submitBtn: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },

    activeBtn: { backgroundColor: '#8B2222', shadowColor: '#8B2222', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },

    submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },

    processingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    processingText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },



    previewCard: {

        width: '100%',

        maxWidth: 650,

        backgroundColor: '#FFFFFF',

        borderRadius: 16,

        borderWidth: 1.5,

        borderColor: '#0B7B3E',

        overflow: 'hidden',

        shadowColor: '#000',

        shadowOpacity: 0.1,

        shadowRadius: 10,

        elevation: 4,

    },

    previewHeader: {

        backgroundColor: '#F0FDF4',

        padding: 16,

        borderBottomWidth: 1,

        borderBottomColor: '#DCFCE7',

        alignItems: 'center',

    },

    previewBadge: {

        backgroundColor: '#0B7B3E',

        color: '#FFFFFF',

        fontSize: 9,

        fontWeight: '900',

        paddingHorizontal: 8,

        paddingVertical: 3,

        borderRadius: 6,

        marginBottom: 4,

    },

    previewTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },

    previewSub: { fontSize: 11, color: '#4B5563', marginTop: 2, textAlign: 'center' },

    cardImage: { width: '100%', height: 260 },

    cardInfo: { padding: 20 },

    fieldLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginTop: 8 },

    fieldValueTitle: { fontSize: 18, fontWeight: '900', color: '#8B2222', marginTop: 2 },

    fieldValueDesc: { fontSize: 13, color: '#374151', lineHeight: 18, marginTop: 4 },

    metaRow: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        marginVertical: 16,

        backgroundColor: '#F9FAFB',

        padding: 12,

        borderRadius: 10,

        borderWidth: 1,

        borderColor: '#E5E7EB',

    },

    metaBox: { alignItems: 'center' },

    metaLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280' },

    metaValueHs: { fontSize: 13, fontWeight: '900', color: '#8B2222', marginTop: 2 },

    metaValue: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginTop: 2 },

    metaValuePrice: { fontSize: 16, fontWeight: '900', color: '#0B7B3E', marginTop: 2 },

    confirmBtn: { backgroundColor: '#0B7B3E', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },

    confirmBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },

    cancelBtn: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 10, alignItems: 'center' },

    cancelBtnText: { color: '#6B7280', fontWeight: '800', fontSize: 13 },

});