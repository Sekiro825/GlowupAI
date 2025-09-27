import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAddHabit: (habit: { title: string; description: string; emoji: string }) => Promise<void>;
  loading?: boolean;
}

export function AddHabitModal({ visible, onClose, onAddHabit, loading = false }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    if (!emoji.trim()) {
      Alert.alert('Error', 'Please enter an emoji for your habit');
      return;
    }

    try {
      await onAddHabit({
        title: title.trim(),
        description: description.trim(),
        emoji: emoji.trim(),
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setEmoji('');
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEmoji('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Habit</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Habit Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Drink Water"
              placeholderTextColor={colors.text.muted}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Stay hydrated throughout the day"
              placeholderTextColor={colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emoji *</Text>
            <TextInput
              style={[styles.input, styles.emojiInput]}
              placeholder="💧"
              placeholderTextColor={colors.text.muted}
              value={emoji}
              onChangeText={setEmoji}
              maxLength={2}
            />
            <Text style={styles.emojiHint}>Choose an emoji that represents your habit</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <PrimaryButton
            title="Add Habit"
            onPress={handleSubmit}
            loading={loading}
            style={styles.addButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    ...shadows.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emojiInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 24,
  },
  emojiHint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});
