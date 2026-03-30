<template>
  <div class="min-h-screen bg-slate-50 pb-16">
    <div v-if="loading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse">
        <div class="h-6 w-32 bg-slate-200 rounded mb-8"></div>
        <div class="h-12 w-3/4 bg-slate-200 rounded-xl mb-4"></div>
        <div class="h-4 w-1/4 bg-slate-200 rounded mb-8"></div>
        <div class="w-full aspect-video bg-slate-200 rounded-3xl mb-8"></div>
        <div class="space-y-3">
          <div class="h-4 w-full bg-slate-200 rounded"></div>
          <div class="h-4 w-full bg-slate-200 rounded"></div>
          <div class="h-4 w-5/6 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!article" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div class="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-800 mb-4">Artikel Tidak Ditemukan</h1>
      <p class="text-slate-600 mb-8">Maaf, artikel yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
      <router-link to="/all-article" class="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Kembali ke Semua Artikel
      </router-link>
    </div>

    <article v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Breadcrumb -->
      <nav class="flex text-sm text-slate-500 mb-8 items-center space-x-2">
        <router-link to="/" class="hover:text-emerald-600 transition">Beranda</router-link>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <router-link to="/all-article" class="hover:text-emerald-600 transition">Artikel</router-link>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        <span class="text-slate-800 font-medium truncate">{{ article.title }}</span>
      </nav>

      <!-- Header -->
      <header class="mb-10 text-center md:text-left">
        <div v-if="article.category" class="mb-4">
          <span class="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">{{ article.category.name }}</span>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight mb-6">{{ article.title }}</h1>
        
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm text-slate-500 border-y border-slate-200 py-4">
          <div class="flex items-center" v-if="article.author">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mr-3 shadow-sm">
              {{ article.author.name.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-slate-700">{{ article.author.name }}</p>
              <p class="text-xs">Penulis</p>
            </div>
          </div>
          
          <div class="hidden md:block w-px h-10 bg-slate-200"></div>
          
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <div>
              <p class="font-bold text-slate-700">{{ formatDate(article.published_at || article.created_at) }}</p>
              <p class="text-xs">Diterbitkan</p>
            </div>
          </div>
          
          <div class="hidden md:block w-px h-10 bg-slate-200"></div>
          
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <div>
              <p class="font-bold text-slate-700">{{ article.views || 0 }}</p>
              <p class="text-xs">Tayangan</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Featured Image -->
      <figure v-if="article.gambar || article.thumbnail" class="mb-10 rounded-3xl overflow-hidden shadow-xl border border-slate-100">
        <img :src="articleImage(article.gambar || article.thumbnail)" :alt="article.title" class="w-full h-auto aspect-video object-cover" />
      </figure>

      <!-- Content -->
      <div class="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 prose prose-slate prose-emerald lg:prose-lg max-w-none prose-img:rounded-2xl prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
        <div v-html="article.content || article.body"></div>
      </div>

      <!-- Comments -->
      <section class="mt-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="flex items-center justify-between gap-4 mb-6">
          <h2 class="text-xl md:text-2xl font-bold text-slate-800">Komentar ({{ comments.length }})</h2>
        </div>

        <form class="space-y-3 mb-8" @submit.prevent="submitComment">
          <div class="grid sm:grid-cols-2 gap-3">
            <input v-model.trim="commentForm.name" type="text" placeholder="Nama" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
            <input v-model.trim="commentForm.email" type="email" placeholder="Email (opsional)" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </div>
          <textarea v-model.trim="commentForm.body" rows="4" placeholder="Tulis komentar Anda..." class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required></textarea>
          <div class="flex justify-end">
            <button type="submit" :disabled="submittingComment" class="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              {{ submittingComment ? 'Mengirim...' : 'Kirim Komentar' }}
            </button>
          </div>
        </form>

        <div v-if="commentsLoading" class="text-sm text-slate-500">Memuat komentar...</div>
        <div v-else-if="!comments.length" class="text-sm text-slate-500">Belum ada komentar. Jadilah yang pertama berkomentar.</div>

        <div v-else class="space-y-5">
          <article v-for="comment in comments" :key="comment.id" class="rounded-2xl border border-slate-200 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-800">{{ comment.name }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(comment.created_at) }}</p>
              </div>
              <button type="button" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800" @click="likeComment(comment)">
                Suka ({{ comment.likes_count || 0 }})
              </button>
            </div>
            <p class="mt-3 text-sm text-slate-700 whitespace-pre-line">{{ comment.body }}</p>

            <div class="mt-3">
              <button type="button" class="text-xs font-semibold text-slate-600 hover:text-slate-800" @click="toggleReply(comment.id)">
                {{ activeReplyFor === comment.id ? 'Batal Balas' : 'Balas' }}
              </button>
            </div>

            <form v-if="activeReplyFor === comment.id" class="mt-3 space-y-2" @submit.prevent="submitReply(comment.id)">
              <div class="grid sm:grid-cols-2 gap-2">
                <input v-model.trim="replyForm.name" type="text" placeholder="Nama" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required>
                <input v-model.trim="replyForm.email" type="email" placeholder="Email (opsional)" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              </div>
              <textarea v-model.trim="replyForm.body" rows="3" placeholder="Tulis balasan..." class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required></textarea>
              <div class="flex justify-end">
                <button type="submit" :disabled="submittingReply" class="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-60">
                  {{ submittingReply ? 'Mengirim...' : 'Kirim Balasan' }}
                </button>
              </div>
            </form>

            <div v-if="comment.replies && comment.replies.length" class="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
              <article v-for="reply in comment.replies" :key="reply.id" class="rounded-xl bg-slate-50 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-sm text-slate-800">{{ reply.name }}</p>
                    <p class="text-[11px] text-slate-500">{{ formatDate(reply.created_at) }}</p>
                  </div>
                  <button type="button" class="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800" @click="likeReply(comment, reply)">
                    Suka ({{ reply.likes_count || 0 }})
                  </button>
                </div>
                <p class="mt-2 text-sm text-slate-700 whitespace-pre-line">{{ reply.body }}</p>
              </article>
            </div>
          </article>
        </div>
      </section>
      
      <!-- Footer Actions -->
      <div class="mt-12 flex justify-between items-center bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
        <router-link to="/all-article" class="inline-flex items-center text-emerald-700 font-bold hover:text-emerald-800 transition">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali
        </router-link>
        
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-emerald-800 mr-2">Bagikan:</span>
          <!-- Share buttons could go here -->
          <button @click="copyLink" class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm hover:shadow hover:bg-emerald-600 hover:text-white transition" title="Copy Link">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  fetchPublicArticleDetail,
  fetchPublicArticleComments,
  createPublicArticleComment,
  replyPublicComment,
  likePublicComment,
} from '@/api/public'
import { normalizePublicMediaUrl } from '@/utils/mediaUrl'

const route = useRoute()
const article = ref(null)
const loading = ref(true)
const comments = ref([])
const commentsLoading = ref(false)
const submittingComment = ref(false)
const submittingReply = ref(false)
const activeReplyFor = ref(null)

const commentForm = ref({
  name: '',
  email: '',
  body: '',
})

const replyForm = ref({
  name: '',
  email: '',
  body: '',
})

const loadArticle = async () => {
  loading.value = true
  try {
    const slug = route.params.slug
    const data = await fetchPublicArticleDetail(slug)
    article.value = data || null
    
    // Update document title
    if (article.value) {
      document.title = `${article.value.title} | Ibnu Hafidz`
    }
  } catch (err) {
    console.error('Failed to load article detail:', err)
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  if (!route.params.slug) return
  commentsLoading.value = true
  try {
    const data = await fetchPublicArticleComments(route.params.slug)
    comments.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load comments:', err)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async () => {
  if (!commentForm.value.name || !commentForm.value.body) return
  submittingComment.value = true
  try {
    await createPublicArticleComment(route.params.slug, commentForm.value)
    commentForm.value = { name: '', email: '', body: '' }
    await loadComments()
  } catch (err) {
    console.error('Failed to submit comment:', err)
  } finally {
    submittingComment.value = false
  }
}

const toggleReply = (commentId) => {
  activeReplyFor.value = activeReplyFor.value === commentId ? null : commentId
  replyForm.value = { name: '', email: '', body: '' }
}

const submitReply = async (commentId) => {
  if (!replyForm.value.name || !replyForm.value.body) return
  submittingReply.value = true
  try {
    await replyPublicComment(commentId, replyForm.value)
    activeReplyFor.value = null
    replyForm.value = { name: '', email: '', body: '' }
    await loadComments()
  } catch (err) {
    console.error('Failed to submit reply:', err)
  } finally {
    submittingReply.value = false
  }
}

const likeComment = async (comment) => {
  try {
    const data = await likePublicComment(comment.id)
    comment.likes_count = data.likes_count ?? (comment.likes_count || 0) + 1
  } catch (err) {
    console.error('Failed to like comment:', err)
  }
}

const likeReply = async (comment, reply) => {
  try {
    const data = await likePublicComment(reply.id)
    reply.likes_count = data.likes_count ?? (reply.likes_count || 0) + 1
    comment.replies = [...(comment.replies || [])]
  } catch (err) {
    console.error('Failed to like reply:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  // Optional: show a toast notification here
  alert('Link disalin ke clipboard!')
}

const articleImage = (path) => normalizePublicMediaUrl(path, '/welcome2.JPG')

onMounted(() => {
  loadArticle()
  loadComments()
})
</script>
