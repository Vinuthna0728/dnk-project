/**
 * CameraCaptureModal Component
 * Guided Camera with live framing bounding box for sarees, pottery, and crafts.
 * Automatically compresses captured photos on-device to ≤2MB using expo-image-manipulator,
 * with Lucide vector icons.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Check,
  Image as ImageIcon,
  RotateCcw,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguageStore } from '../../store/useLanguageStore';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onImageCaptured: (imageUri: string) => void;
}

export type GuideType = 'craft' | 'saree' | 'pottery';

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  visible,
  onClose,
  onImageCaptured,
}) => {
  const { t } = useLanguageStore();
  const [guideType, setGuideType] = useState<GuideType>('craft');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  /**
   * Compress image on-device to ≤2MB
   */
  const processAndCompressImage = async (rawUri: string) => {
    setIsCompressing(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: 1400 } }],
        { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPreviewUri(manipResult.uri);
    } catch (err) {
      console.warn('[CameraCapture] Compression error, using raw image:', err);
      setPreviewUri(rawUri);
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('gallery_permission_denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: guideType === 'saree' ? [4, 5] : guideType === 'pottery' ? [1, 1] : [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      await processAndCompressImage(result.assets[0].uri);
    }
  };

  const handleLaunchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert(t('camera_permission_denied'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: guideType === 'saree' ? [4, 5] : guideType === 'pottery' ? [1, 1] : [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      await processAndCompressImage(result.assets[0].uri);
    }
  };

  const handleConfirm = () => {
    if (previewUri) {
      onImageCaptured(previewUri);
      setPreviewUri(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
  };

  const guideText =
    guideType === 'saree'
      ? t('camera_guide_saree')
      : guideType === 'pottery'
      ? t('camera_guide_pottery')
      : t('camera_guide_craft');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Camera size={20} color={Colors.primary} strokeWidth={2.4} />
              <View>
                <Text style={styles.title}>{t('step_camera')}</Text>
                <Text style={styles.subTitle}>{guideText}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={18} color="#4B5563" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Guide Overlay Selector */}
          {!previewUri ? (
            <View style={styles.guideSelector}>
              <TouchableOpacity
                onPress={() => setGuideType('craft')}
                style={[styles.guideChip, guideType === 'craft' && styles.activeGuideChip]}
              >
                <Text style={[styles.guideChipText, guideType === 'craft' && styles.activeGuideText]}>
                  {t('guide_craft')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGuideType('saree')}
                style={[styles.guideChip, guideType === 'saree' && styles.activeGuideChip]}
              >
                <Text style={[styles.guideChipText, guideType === 'saree' && styles.activeGuideText]}>
                  {t('guide_saree')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGuideType('pottery')}
                style={[styles.guideChip, guideType === 'pottery' && styles.activeGuideChip]}
              >
                <Text style={[styles.guideChipText, guideType === 'pottery' && styles.activeGuideText]}>
                  {t('guide_pottery')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Viewfinder / Preview Display */}
          <View style={styles.viewfinderContainer}>
            {previewUri ? (
              <RNImage source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.emptyViewfinder}>
                {/* Guided Aspect Ratio Overlay Box */}
                <View
                  style={[
                    styles.boundingFrame,
                    guideType === 'saree' && styles.sareeFrame,
                    guideType === 'pottery' && styles.potteryFrame,
                  ]}
                >
                  <View style={styles.frameCornerTL} />
                  <View style={styles.frameCornerTR} />
                  <View style={styles.frameCornerBL} />
                  <View style={styles.frameCornerBR} />
                  <Text style={styles.frameInstruction}>{guideText}</Text>
                </View>
              </View>
            )}

            {isCompressing ? (
              <View style={styles.compressingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.compressingText}>
                  {t('compressing_image')}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Controls Footer */}
          <View style={styles.footerControls}>
            {previewUri ? (
              <View style={styles.previewActions}>
                <TouchableOpacity onPress={handleRetake} style={styles.retakeBtn} activeOpacity={0.8}>
                  <RotateCcw size={16} color="#4B5563" strokeWidth={2.2} />
                  <Text style={styles.retakeBtnText}>{t('btn_retake')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn} activeOpacity={0.85}>
                  <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.confirmBtnText}>{t('confirm')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.captureActions}>
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  style={styles.secondaryBtn}
                  activeOpacity={0.8}
                >
                  <ImageIcon size={18} color={Colors.textPrimary} strokeWidth={2.2} />
                  <Text style={styles.secondaryBtnText}>{t('btn_gallery')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLaunchCamera}
                  style={styles.primaryCaptureBtn}
                  activeOpacity={0.85}
                >
                  <Camera size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.primaryCaptureBtnText}>{t('btn_take_photo')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAF7F2',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE9DF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexWrap: 'wrap',
  },
  guideChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeGuideChip: {
    backgroundColor: '#FDF2F2',
    borderColor: Colors.primary,
  },
  guideChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  activeGuideText: {
    color: Colors.primary,
    fontWeight: '900',
  },
  viewfinderContainer: {
    width: '100%',
    height: 340,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyViewfinder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  boundingFrame: {
    width: '80%',
    height: '75%',
    borderWidth: 2,
    borderColor: '#FFD54F',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sareeFrame: {
    width: '70%',
    height: '88%',
  },
  potteryFrame: {
    width: '75%',
    height: '75%',
  },
  frameCornerTL: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFD54F',
  },
  frameCornerTR: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFD54F',
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: -3,
    left: -3,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFD54F',
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFD54F',
  },
  frameInstruction: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  compressingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  compressingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  footerControls: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  captureActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  primaryCaptureBtn: {
    flex: 1.3,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryCaptureBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
  },
  confirmBtn: {
    flex: 1.5,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default CameraCaptureModal;
