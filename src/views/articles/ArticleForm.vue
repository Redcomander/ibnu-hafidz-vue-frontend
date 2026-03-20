<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center gap-4 mb-8">
      <button @click="$router.back()" class="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
        <SvgIcon name="arrow-left" :size="20" />
      </button>
      <div>
        <h1 class="text-2xl font-extrabold text-primary-dark tracking-tight">
          {{ isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru' }}
        </h1>
        <p class="text-gray-500 text-sm mt-1">{{ isEdit ? 'Perbarui konten artikel' : 'Buat konten berita atau artikel baru' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-card p-6 !rounded-2xl">
          <div class="space-y-5">
            <div>
              <label class="label-field">Judul Artikel <span class="text-red-500">*</span></label>
              <input v-model="form.title" type="text" class="input-field !rounded-xl !py-3 text-lg font-medium" placeholder="Masukkan judul artikel..." />
            </div>

            <!-- Editor / Preview Tabs -->
            <div>
              <div class="flex items-center gap-1 mb-3 border-b border-gray-200">
                <button
                  @click="activeTab = 'editor'"
                  :class="['px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px', activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600']"
                >
                  <span class="flex items-center gap-1.5">
                    <SvgIcon name="edit" :size="14" />
                    Editor
                  </span>
                </button>
                <button
                  @click="activeTab = 'preview'"
                  :class="['px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px', activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600']"
                >
                  <span class="flex items-center gap-1.5">
                    <SvgIcon name="eye" :size="14" />
                    Preview
                  </span>
                </button>
                <!-- Gallery button for editor -->
                <button
                  v-if="activeTab === 'editor'"
                  @click="galleryPickerTarget = 'editor'; showGalleryPicker = true; fetchGalleryImages()"
                  class="ml-auto px-3 py-2 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                >
                  <SvgIcon name="image" :size="14" />
                  Sisipkan dari Galeri
                </button>
              </div>

              <!-- Tiptap Editor -->
              <div v-show="activeTab === 'editor'">
                <div class="tiptap-wrapper border border-gray-200 rounded-xl overflow-hidden">
                  <div class="tiptap-toolbar">
                    <!-- Text Formatting -->
                    <div class="toolbar-group">
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('bold'))" @click="editor?.chain().focus().toggleBold().run()" title="Bold (Ctrl+B)">
                        <span class="font-bold">B</span>
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('italic'))" @click="editor?.chain().focus().toggleItalic().run()" title="Italic (Ctrl+I)">
                        <span class="italic">I</span>
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('underline'))" @click="editor?.chain().focus().toggleUnderline().run()" title="Underline (Ctrl+U)">
                        <span class="underline">U</span>
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('strike'))" @click="editor?.chain().focus().toggleStrike().run()" title="Strikethrough">
                        <span class="line-through text-xs">S</span>
                      </button>
                    </div>

                    <!-- Lists & Blocks -->
                    <div class="toolbar-group">
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('bulletList'))" @click="editor?.chain().focus().toggleBulletList().run()" title="Bullet List">
                        <SvgIcon name="list" :size="16" />
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('orderedList'))" @click="editor?.chain().focus().toggleOrderedList().run()" title="Numbered List">
                        <span class="text-xs font-bold">1.</span>
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('blockquote'))" @click="editor?.chain().focus().toggleBlockquote().run()" title="Quote">
                        <SvgIcon name="quote" :size="16" />
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive('codeBlock'))" @click="editor?.chain().focus().toggleCodeBlock().run()" title="Code Block">
                        <SvgIcon name="code" :size="16" />
                      </button>
                    </div>

                    <!-- Alignment -->
                    <div class="toolbar-group">
                      <button type="button" :class="toolbarBtnClass(editor?.isActive({ textAlign: 'left' }))" @click="editor?.chain().focus().setTextAlign('left').run()" title="Align Left">
                        <SvgIcon name="align-left" :size="16" />
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive({ textAlign: 'center' }))" @click="editor?.chain().focus().setTextAlign('center').run()" title="Align Center">
                        <SvgIcon name="align-center" :size="16" />
                      </button>
                      <button type="button" :class="toolbarBtnClass(editor?.isActive({ textAlign: 'right' }))" @click="editor?.chain().focus().setTextAlign('right').run()" title="Align Right">
                        <SvgIcon name="align-right" :size="16" />
                      </button>
                    </div>

                    <!-- Utilities -->
                    <div class="toolbar-group">
                      <button type="button" :class="toolbarBtnClass(false)" @click="setEditorLink" title="Add Link">
                        <SvgIcon name="link" :size="16" />
                      </button>
                      <button type="button" :class="toolbarBtnClass(false)" @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()" title="Clear Formatting">
                        <SvgIcon name="x" :size="16" />
                      </button>
                    </div>
                  </div>
                  <EditorContent :editor="editor" class="tiptap-editor" />
                </div>
              </div>

              <!-- Preview -->
              <div v-show="activeTab === 'preview'" class="preview-panel border border-gray-200 rounded-xl bg-white min-h-[350px]">
                <div class="max-w-3xl mx-auto p-6 md:p-10">
                  <div class="mb-6">
                    <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span v-if="selectedCategory" class="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-semibold">{{ selectedCategory.name }}</span>
                      <span>{{ previewDate }}</span>
                      <span>&middot;</span>
                      <span>{{ readingTime }}</span>
                    </div>
                    <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{{ form.title || 'Judul Artikel' }}</h1>
                  </div>
                  <div v-if="thumbnailPreview || (isEdit && form.existing_thumbnail)" class="rounded-xl overflow-hidden mb-8 shadow-sm">
                    <img :src="thumbnailPreview || '/uploads/' + form.existing_thumbnail" class="w-full max-h-[360px] object-cover" />
                  </div>
                  <article class="ql-editor-preview prose prose-sm md:prose-base max-w-none" v-html="form.body || '<p class=\'text-gray-400 italic\'>Mulai menulis konten artikel...</p>'"></article>
                  <div v-if="selectedTags.length > 0" class="mt-8 pt-6 border-t border-gray-100">
                    <div class="flex flex-wrap gap-2">
                      <span v-for="t in selectedTags" :key="t.id" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{{ t.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="label-field">Ringkasan (Excerpt)</label>
              <textarea v-model="form.excerpt" rows="3" class="input-field !rounded-xl" placeholder="Ringkasan singkat artikel..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Publish Settings -->
        <div class="glass-card p-5 !rounded-2xl">
          <h3 class="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <SvgIcon name="settings" :size="16" class="text-gray-400" />
            Pengaturan Publish
          </h3>
          <div class="space-y-4">
            <div>
              <label class="label-field">Status</label>
              <select v-model="form.status" class="input-field !rounded-xl">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label class="label-field">Kategori</label>
              <select v-model="form.category_id" class="input-field !rounded-xl">
                <option value="">Tanpa Kategori</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="label-field">Tag</label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <span v-for="t in selectedTags" :key="t.id" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {{ t.name }}
                  <button @click="removeTag(t.id)" class="hover:text-red-500 transition-colors">&times;</button>
                </span>
              </div>
              <select @change="addTag($event)" class="input-field !rounded-xl">
                <option value="">Pilih tag...</option>
                <option v-for="t in availableTags" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="glass-card p-5 !rounded-2xl">
          <h3 class="font-bold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <SvgIcon name="image" :size="16" class="text-gray-400" />
            Thumbnail
          </h3>
          <div v-if="thumbnailPreview || (isEdit && form.existing_thumbnail)" class="mb-3 rounded-xl overflow-hidden shadow-sm">
            <img :src="thumbnailPreview || '/uploads/' + form.existing_thumbnail" class="w-full h-40 object-cover" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <!-- Upload from file -->
            <div
              class="flex flex-col items-center justify-center px-3 py-4 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 hover:bg-gray-100/50 hover:border-primary/30 transition-all cursor-pointer"
              @click="$refs.thumbnailInput.click()"
            >
              <SvgIcon name="upload" :size="22" class="text-gray-400 mb-1" />
              <p class="text-[11px] text-gray-500 font-medium text-center">Upload File</p>
              <input type="file" ref="thumbnailInput" accept="image/*" class="sr-only" @change="onThumbnailSelected" />
            </div>
            <!-- Pick from gallery -->
            <div
              class="flex flex-col items-center justify-center px-3 py-4 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
              @click="galleryPickerTarget = 'thumbnail'; showGalleryPicker = true; fetchGalleryImages()"
            >
              <SvgIcon name="image" :size="22" class="text-primary/50 mb-1" />
              <p class="text-[11px] text-primary font-medium text-center">Dari Galeri</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="glass-card p-5 !rounded-2xl space-y-3">
          <button @click="handleSubmit" :disabled="saving" class="btn-primary w-full flex items-center justify-center gap-2 !rounded-xl !py-3 shadow-lg shadow-green-200/40">
            <SvgIcon name="check" :size="16" />
            {{ saving ? 'Menyimpan...' : (isEdit ? 'Perbarui Artikel' : 'Publish Artikel') }}
          </button>
          <button @click="$router.back()" class="btn-secondary w-full !rounded-xl !py-3">Batal</button>
        </div>
      </div>
    </div>

    <!-- Gallery Image Picker Modal -->
    <Modal :show="showGalleryPicker" @close="showGalleryPicker = false" :title="galleryPickerTarget === 'thumbnail' ? 'Pilih Thumbnail dari Galeri' : 'Sisipkan Gambar dari Galeri'" maxWidth="lg">
      <div>
        <!-- Search -->
        <div class="mb-4">
          <input v-model="gallerySearch" type="text" class="input-field !rounded-xl !py-2.5" placeholder="Cari gambar..." @input="fetchGalleryImages" />
        </div>

        <!-- Loading -->
        <div v-if="galleryLoading" class="text-center py-12 text-gray-400">
          <div class="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          Memuat galeri...
        </div>

        <!-- Images Grid -->
        <div v-else-if="galleryImages.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
          <div
            v-for="img in galleryImages"
            :key="img.id"
            @click="selectGalleryImage(img)"
            class="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:shadow-lg"
          >
            <img :src="'/uploads/' + img.path" class="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-200" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div class="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <SvgIcon name="check" :size="16" class="text-primary" />
              </div>
            </div>
            <p class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] px-2 py-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {{ img.title }}
            </p>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="text-center py-12 text-gray-400">
          <SvgIcon name="image" :size="40" class="mx-auto mb-3 text-gray-300" />
          <p class="text-sm">Belum ada foto di galeri</p>
        </div>

        <!-- Pagination -->
        <div v-if="galleryTotalPages > 1" class="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            v-for="p in galleryTotalPages"
            :key="p"
            @click="galleryPage = p; fetchGalleryImages()"
            :class="['w-8 h-8 rounded-lg text-xs font-medium transition-colors', p === galleryPage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          >{{ p }}</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import Modal from '@/components/ui/Modal.vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const categories = ref([])
const allTags = ref([])
const selectedTags = ref([])
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const activeTab = ref('editor')

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Image,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Mulai menulis konten artikel...' }),
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'tiptap-content',
    },
  },
  onUpdate: ({ editor }) => {
    form.value.body = editor.getHTML()
  },
})

const form = ref({
  title: '',
  body: '',
  excerpt: '',
  category_id: '',
  status: 'draft',
  existing_thumbnail: null,
})

// Gallery picker
const showGalleryPicker = ref(false)
const galleryPickerTarget = ref('editor') // 'editor' or 'thumbnail'
const galleryImages = ref([])
const galleryLoading = ref(false)
const gallerySearch = ref('')
const galleryPage = ref(1)
const galleryTotalPages = ref(1)

function toolbarBtnClass(active) {
  return ['toolbar-btn', active ? 'is-active' : '']
}

function setEditorLink() {
  const previousUrl = editor.value?.getAttributes('link').href || ''
  const url = window.prompt('Masukkan URL', previousUrl)
  if (url === null) return
  const trimmed = url.trim()
  if (trimmed === '') {
    editor.value?.chain().focus().unsetLink().run()
    return
  }

  const safeProtocol = /^(https?:|mailto:|tel:)/i
  if (!safeProtocol.test(trimmed)) {
    window.alert('URL tidak valid. Gunakan http://, https://, mailto:, atau tel:')
    return
  }

  editor.value?.chain().focus().setLink({ href: trimmed }).run()
}

const selectedCategory = computed(() => {
  if (!form.value.category_id) return null
  return categories.value.find(c => c.id === parseInt(form.value.category_id))
})

const readingTime = computed(() => {
  if (!form.value.body) return '1 min read'
  const text = form.value.body.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(words / 200)) + ' min read'
})

const previewDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const availableTags = computed(() =>
  allTags.value.filter(t => !selectedTags.value.find(st => st.id === t.id))
)

function addTag(e) {
  const id = parseInt(e.target.value)
  if (!id) return
  const tag = allTags.value.find(t => t.id === id)
  if (tag) selectedTags.value.push(tag)
  e.target.value = ''
}

function removeTag(id) {
  selectedTags.value = selectedTags.value.filter(t => t.id !== id)
}

function onThumbnailSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  thumbnailFile.value = file
  thumbnailPreview.value = URL.createObjectURL(file)
}

// Gallery image picker
async function fetchGalleryImages() {
  galleryLoading.value = true
  try {
    const params = { page: galleryPage.value, per_page: 20, type: 'photo' }
    if (gallerySearch.value) params.search = gallerySearch.value
    const { data } = await api.get('/gallery/items', { params })
    galleryImages.value = data.data || []
    galleryTotalPages.value = data.total_pages || 1
  } catch (e) { console.error(e) }
  galleryLoading.value = false
}

function selectGalleryImage(img) {
  if (galleryPickerTarget.value === 'thumbnail') {
    // Set as thumbnail
    thumbnailPreview.value = '/uploads/' + img.path
    thumbnailFile.value = null // Will need to send the path instead
    form.value.thumbnail_from_gallery = img.path
    showGalleryPicker.value = false
  } else {
    const imgUrl = '/uploads/' + img.path
    editor.value?.chain().focus().setImage({ src: imgUrl }).run()
    showGalleryPicker.value = false
  }
}

async function fetchMeta() {
  try {
    const [catRes, tagRes] = await Promise.all([
      api.get('/articles/categories'),
      api.get('/articles/tags'),
    ])
    categories.value = catRes.data.data || []
    allTags.value = tagRes.data.data || []
  } catch (e) { console.error(e) }
}

async function fetchArticle() {
  if (!isEdit.value) return
  try {
    const { data } = await api.get('/articles/', { params: { per_page: 999 } })
    const article = (data.data || []).find(a => a.id === parseInt(route.params.id))
    if (article) {
      form.value.title = article.title
      form.value.body = article.body
      form.value.excerpt = article.excerpt || ''
      form.value.category_id = article.category_id || ''
      form.value.status = article.status
      form.value.existing_thumbnail = article.thumbnail
      selectedTags.value = article.tags || []
      editor.value?.commands.setContent(form.value.body || '')
    }
  } catch (e) { console.error(e) }
}

async function handleSubmit() {
  if (!form.value.title || !form.value.body) return
  saving.value = true

  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('body', form.value.body)
    if (form.value.excerpt) fd.append('excerpt', form.value.excerpt)
    if (form.value.category_id) fd.append('category_id', form.value.category_id)
    fd.append('status', form.value.status)

    if (selectedTags.value.length > 0) {
      fd.append('tag_ids', selectedTags.value.map(t => t.id).join(','))
    }
    if (thumbnailFile.value) {
      fd.append('thumbnail', thumbnailFile.value)
    } else if (form.value.thumbnail_from_gallery) {
      fd.append('thumbnail_from_gallery', form.value.thumbnail_from_gallery)
    }

    if (isEdit.value) {
      await api.put(`/articles/${route.params.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/articles/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    router.push({ name: 'articles' })
  } catch (e) { console.error(e) }
  saving.value = false
}

onMounted(() => {
  fetchMeta()
  fetchArticle()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border-right: 1px solid #d1d5db;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  -webkit-user-select: none;
  user-select: none;
}

.toolbar-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-btn.is-active {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  border-color: #6ee7b7;
  color: #065f46;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.toolbar-btn.is-active:hover {
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);
}

.tiptap-editor {
  min-height: 300px;
  background: #ffffff;
}
.tiptap-editor :deep(.ProseMirror) {
  min-height: 300px;
}
.tiptap-content {
  min-height: 300px;
  padding: 1rem;
  line-height: 1.7;
  outline: none;
}
.tiptap-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
}
.tiptap-content a {
  color: #2563eb;
  text-decoration: underline;
}
.tiptap-content p.is-editor-empty:first-child::before {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

[data-theme="dark"] .preview-panel {
  background: #111827;
  border-color: #334155;
}
[data-theme="dark"] .tiptap-wrapper {
  border-color: #334155 !important;
}
[data-theme="dark"] .tiptap-toolbar {
  background: linear-gradient(to bottom, #0f172a, #1a202c);
  border-color: #334155;
}
[data-theme="dark"] .toolbar-group {
  border-right-color: #475569;
}
[data-theme="dark"] .toolbar-btn {
  border-color: #475569;
  background: #1f2937;
  color: #e2e8f0;
}
[data-theme="dark"] .toolbar-btn:hover {
  background: #273449;
  border-color: #64748b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
[data-theme="dark"] .toolbar-btn.is-active {
  background: linear-gradient(135deg, rgba(21, 128, 61, 0.4) 0%, rgba(34, 197, 94, 0.3) 100%);
  border-color: #22c55e;
  color: #dcfce7;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.15);
}
[data-theme="dark"] .tiptap-editor {
  background: #111827;
}
[data-theme="dark"] .tiptap-content {
  color: #e2e8f0;
  caret-color: #f8fafc;
}
[data-theme="dark"] .tiptap-content p.is-editor-empty:first-child::before {
  color: #94a3b8;
}
[data-theme="dark"] .tiptap-content blockquote {
  border-left-color: #60a5fa;
  background: #1e293b;
  color: #bfdbfe;
}
[data-theme="dark"] .tiptap-content pre {
  background: #020617;
  color: #cbd5e1;
}
[data-theme="dark"] .tiptap-content a {
  color: #93c5fd;
}

/* Preview article prose styles */
.ql-editor-preview {
  line-height: 1.8;
  color: #374151;
}
.ql-editor-preview h1 { font-size: 1.75rem; font-weight: 700; margin: 1.5em 0 0.5em; color: #111827; }
.ql-editor-preview h2 { font-size: 1.4rem; font-weight: 700; margin: 1.25em 0 0.5em; color: #1f2937; }
.ql-editor-preview h3 { font-size: 1.15rem; font-weight: 600; margin: 1em 0 0.4em; color: #1f2937; }
.ql-editor-preview p { margin: 0.75em 0; }
.ql-editor-preview ul, .ql-editor-preview ol { padding-left: 1.75em; margin: 0.75em 0; }
.ql-editor-preview li { margin: 0.25em 0; }
.ql-editor-preview blockquote {
  border-left: 4px solid #3b82f6;
  margin: 1em 0;
  padding: 0.75em 1em;
  background: #eff6ff;
  border-radius: 0 0.5rem 0.5rem 0;
  color: #1e40af;
  font-style: italic;
}
.ql-editor-preview pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.85em;
}
.ql-editor-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1em 0;
}
.ql-editor-preview a {
  color: #2563eb;
  text-decoration: underline;
}
.ql-editor-preview strong { font-weight: 700; }
.ql-editor-preview em { font-style: italic; }

[data-theme="dark"] .ql-editor-preview {
  color: #cbd5e1;
}
[data-theme="dark"] .ql-editor-preview h1,
[data-theme="dark"] .ql-editor-preview h2,
[data-theme="dark"] .ql-editor-preview h3 {
  color: #f8fafc;
}
[data-theme="dark"] .ql-editor-preview blockquote {
  border-left-color: #60a5fa;
  background: #1e293b;
  color: #bfdbfe;
}
[data-theme="dark"] .ql-editor-preview pre {
  background: #020617;
  color: #cbd5e1;
}
[data-theme="dark"] .ql-editor-preview a {
  color: #93c5fd;
}
</style>
