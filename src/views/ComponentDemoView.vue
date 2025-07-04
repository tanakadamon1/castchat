<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">UI Components Demo</h1>
    
    <!-- Form Components -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Form Components</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <BaseInput
            v-model="demoForm.name"
            label="Name"
            placeholder="Enter your name"
            hint="This is a required field"
            required
          />
          
          <BaseInput
            v-model="demoForm.email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            :error="emailError"
          />
          
          <BaseTextarea
            v-model="demoForm.description"
            label="Description"
            placeholder="Tell us about yourself..."
            :maxlength="500"
            show-count
            :rows="4"
          />
          
          <BaseSelect
            v-model="demoForm.category"
            label="Category"
            placeholder="Select a category"
            :options="categoryOptions"
          />
        </div>
        
        <div class="space-y-6">
          <BaseCheckbox
            v-model="demoForm.newsletter"
            label="Subscribe to newsletter"
            description="Get updates about new features and announcements"
          />
          
          <BaseCheckbox
            v-model="demoForm.terms"
            :error="termsError"
            required
          >
            I agree to the <a href="#" class="text-indigo-600 hover:underline">terms and conditions</a>
          </BaseCheckbox>
          
          <div class="flex flex-wrap gap-3">
            <BaseButton @click="handleSubmit">
              Submit Form
            </BaseButton>
            
            <BaseButton variant="secondary" @click="resetForm">
              Reset
            </BaseButton>
            
            <BaseButton variant="outline" @click="showModal = true">
              Open Modal
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Button Variants -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Button Variants</h2>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="outline">Outline</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton variant="danger">Danger</BaseButton>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <BaseButton size="xs">Extra Small</BaseButton>
        <BaseButton size="sm">Small</BaseButton>
        <BaseButton size="md">Medium</BaseButton>
        <BaseButton size="lg">Large</BaseButton>
      </div>
    </section>
    
    <!-- Toast Demo -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Toast Notifications</h2>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BaseButton variant="outline" @click="showSuccessToast">
          Success Toast
        </BaseButton>
        <BaseButton variant="outline" @click="showErrorToast">
          Error Toast
        </BaseButton>
        <BaseButton variant="outline" @click="showWarningToast">
          Warning Toast
        </BaseButton>
        <BaseButton variant="outline" @click="showInfoToast">
          Info Toast
        </BaseButton>
      </div>
    </section>
    
    <!-- Demo Modal -->
    <BaseModal
      v-model:show="showModal"
      title="Demo Modal"
      size="md"
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          This is a demo modal showing how the modal component works.
        </p>
        
        <BaseInput
          v-model="modalInput"
          label="Input in Modal"
          placeholder="Type something..."
        />
      </div>
      
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">
          Cancel
        </BaseButton>
        <BaseButton @click="handleModalSubmit">
          Submit
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BaseInput,
  BaseTextarea,
  BaseButton,
  BaseSelect,
  BaseCheckbox,
  BaseModal,
  toast
} from '@/components/ui'

// Demo form data
const demoForm = ref({
  name: '',
  email: '',
  description: '',
  category: '',
  newsletter: false,
  terms: false
})

const modalInput = ref('')
const showModal = ref(false)

// Form validation
const emailError = computed(() => {
  if (demoForm.value.email && !isValidEmail(demoForm.value.email)) {
    return 'Please enter a valid email address'
  }
  return undefined
})

const termsError = computed(() => {
  if (!demoForm.value.terms) {
    return 'You must agree to the terms and conditions'
  }
  return undefined
})

// Options for select component
const categoryOptions = [
  { label: 'Technology', value: 'tech' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Business', value: 'business' }
]

// Helper functions
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = () => {
  if (emailError.value || termsError.value) {
    toast.error('Please fix the form errors before submitting')
    return
  }
  
  toast.success('Form submitted successfully!')
}

const resetForm = () => {
  demoForm.value = {
    name: '',
    email: '',
    description: '',
    category: '',
    newsletter: false,
    terms: false
  }
  toast.info('Form has been reset')
}

const handleModalSubmit = () => {
  showModal.value = false
  toast.success(`Modal input: "${modalInput.value}"`)
  modalInput.value = ''
}

// Toast demo functions
const showSuccessToast = () => {
  toast.success('This is a success message!')
}

const showErrorToast = () => {
  toast.error('This is an error message!')
}

const showWarningToast = () => {
  toast.warning('This is a warning message!')
}

const showInfoToast = () => {
  toast.info('This is an info message!')
}
</script>