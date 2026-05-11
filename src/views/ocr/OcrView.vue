<template>
  <div class="ocr-root space-y-6 pb-16">

    <!-- Page Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-primary-dark tracking-tight">Scanner Lembar Jawab</h1>
        <p class="text-gray-500 text-sm mt-1">Scan dan koreksi lembar jawab santri secara otomatis</p>
      </div>
      <button @click="showAnswerKeyModal = true"
        class="btn-secondary flex items-center gap-2 text-sm shrink-0">
        <SvgIcon name="document" :size="16" />
        <span class="hidden sm:inline">Kunci Jawaban</span>
      </button>
    </div>

    <!-- Service Offline Banner -->
    <div v-if="serviceOffline" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <SvgIcon name="close" :size="18" class="text-red-500 mt-0.5 shrink-0" />
      <div>
        <p class="text-sm font-semibold text-red-700">Layanan OCR tidak aktif</p>
        <p class="text-xs text-red-600 mt-0.5">Pastikan <code class="bg-red-100 px-1 rounded">ibnu-hafidz-ocr-service</code> sudah berjalan di port 3099.</p>
      </div>
    </div>

    <!-- Answer Key Selector -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4">
      <div class="flex items-center justify-between gap-3 mb-3">
        <span class="text-sm font-semibold text-gray-700">Kunci Jawaban Aktif</span>
        <button @click="loadAnswerKeys" class="text-xs text-primary hover:underline">Refresh</button>
      </div>
      <div v-if="answerKeys.length === 0" class="text-sm text-gray-400 italic">
        Belum ada kunci jawaban. Buat terlebih dahulu.
      </div>
      <div v-else class="flex flex-wrap gap-2">
        <button v-for="ak in answerKeys" :key="ak.id"
          @click="selectedAnswerKeyId = ak.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
            selectedAnswerKeyId === ak.id
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary/50'
          ]">
          {{ ak.name || `Kunci #${ak.id}` }}
        </button>
      </div>
    </div>

    <!-- Academic Integration -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm font-semibold text-gray-700">Integrasi Akademik</span>
        <button @click="loadAcademicData" class="text-xs text-primary hover:underline">Refresh</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-medium text-gray-500">Tipe Pelajaran</label>
          <select v-model="lessonType" @change="handleLessonTypeChange"
            class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="formal">Formal</option>
            <option value="diniyyah">Diniyyah</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">Pelajaran</label>
          <select v-model="selectedLessonId" @change="handleLessonOrClassChange"
            class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option :value="null">Pilih pelajaran</option>
            <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">{{ lesson.name || `Pelajaran #${lesson.id}` }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">Kelas</label>
          <select v-model="selectedClassId" @change="handleLessonOrClassChange"
            class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option :value="null">Pilih kelas</option>
            <option v-for="k in classes" :key="k.id" :value="k.id">{{ classLabel(k) }}</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">Guru</label>
          <select v-model="selectedTeacherId"
            class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option :value="null">Pilih guru</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name || `Guru #${t.id}` }}</option>
          </select>
        </div>
      </div>

      <div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ringkasan Integrasi</p>
        <div class="mt-2 text-sm text-gray-700 space-y-1">
          <p><span class="text-gray-400">Pelajaran:</span> {{ selectedLessonObj?.name || 'Belum dipilih' }}</p>
          <p><span class="text-gray-400">Kelas:</span> {{ selectedClassObj ? classLabel(selectedClassObj) : 'Belum dipilih' }}</p>
          <p><span class="text-gray-400">Guru:</span> {{ selectedTeacherObj?.name || 'Belum dipilih' }}</p>
          <p><span class="text-gray-400">Santri Kelas:</span> {{ selectedClassStudents.length }}</p>
        </div>
      </div>
    </div>

    <!-- Scan Calibration -->
    <details class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4" open>
      <summary class="cursor-pointer flex items-center justify-between gap-3 text-sm font-semibold text-gray-700">
        Penyesuaian Posisi Blok Scan
      </summary>
      <div class="mt-3 space-y-3">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div>
            <label class="text-[11px] uppercase tracking-wide text-gray-400">Layout Soal</label>
            <select v-model.number="selectedQuestionTotal" class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5">
              <option v-for="total in QUESTION_LAYOUTS" :key="total" :value="total">{{ total }} Soal</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] uppercase tracking-wide text-gray-400">Pilihan Opsi</label>
            <select v-model="selectedOptionChoices" class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5">
              <option value="ABCD">A-D</option>
              <option value="ABCDE">A-E</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] uppercase tracking-wide text-gray-400">Rotasi</label>
            <select v-model.number="scanRotation" class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5">
              <option :value="0">0°</option>
              <option :value="90">90°</option>
              <option :value="180">180°</option>
              <option :value="270">270°</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] uppercase tracking-wide text-gray-400">Threshold</label>
            <input v-model.number="scanCalibration.markedThreshold" type="number" min="0" max="255" class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5" />
          </div>
          <div>
            <label class="text-[11px] uppercase tracking-wide text-gray-400">Confidence Gap</label>
            <input v-model.number="scanCalibration.confidenceGap" type="number" step="0.1" min="0" max="255" class="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5" />
          </div>
          <div class="flex items-end">
            <button @click="resetCalibration" class="w-full text-xs font-semibold rounded-lg border border-gray-200 px-2 py-2 hover:bg-gray-50">Reset Default</button>
          </div>
        </div>

        <!-- Template Registration -->
        <div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Template Lembar Jawaban</p>
          <div v-if="templateRegistered" class="flex items-center gap-2 flex-wrap">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 truncate">{{ templateRegistered.name }}</p>
              <p class="text-[10px] text-gray-400">{{ templateRegistered.total }} soal · {{ templateRegistered.optionChoices }}</p>
            </div>
            <button
              type="button"
              @click="applyRegisteredTemplate"
              class="shrink-0 text-xs font-semibold rounded-lg bg-primary text-white px-2.5 py-1.5 hover:bg-primary/90"
            >Terapkan</button>
            <button
              type="button"
              @click="removeTemplate"
              class="shrink-0 text-xs font-semibold rounded-lg border border-red-200 text-red-500 px-2.5 py-1.5 hover:bg-red-50"
            >Hapus</button>
          </div>
          <div v-else class="flex items-center gap-2">
            <label class="flex-1 cursor-pointer">
              <span
                class="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                :class="{ 'opacity-60 pointer-events-none': templateLoading }"
              >
                <span v-if="templateLoading">Memproses…</span>
                <span v-else>Daftar Template DOCX</span>
              </span>
              <input type="file" accept=".docx" class="sr-only" :disabled="templateLoading" @change="uploadTemplate" />
            </label>
          </div>
          <p v-if="templateError" class="text-[11px] text-red-500">{{ templateError }}</p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Manual Blok Jawaban</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              v-for="(block, idx) in scanCalibration.blocks"
              :key="idx"
              @click="selectedCalibrationBlockIndex = idx"
              :class="[
                'rounded-lg border px-2 py-2 text-left',
                selectedCalibrationBlockIndex === idx
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              ]"
            >
              <p class="text-xs font-semibold">Blok {{ idx + 1 }}</p>
              <p class="text-[10px] opacity-80">Q{{ block.startQ }}-{{ block.startQ + block.count - 1 }}</p>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              @click="selectBlockByStartQ(31)"
              class="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              Fokus Q31-40
            </button>
            <button
              @click="selectBlockByStartQ(41)"
              class="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              Fokus Q41-50
            </button>
            <button
              @click="rescanAfterCalibrate"
              :disabled="!previewFile || scanning"
              class="rounded-lg border border-primary/30 bg-primary/5 px-2 py-2 text-xs font-semibold text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ scanning ? 'Memproses...' : 'Rescan Kalibrasi' }}
            </button>
            <div class="text-[10px] text-gray-500 flex items-center px-2">
              Rescan pakai foto aktif + kalibrasi terbaru
            </div>
          </div>

          <div class="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-semibold text-gray-700">Preview Kalibrasi Besar</p>
              <div class="flex items-center gap-1.5 flex-wrap justify-end">
                <button @click="setCalibrationZoom(1)" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold">100%</button>
                <button @click="setCalibrationZoom(1.5)" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold">150%</button>
                <button @click="setCalibrationZoom(2)" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold">200%</button>
                <button @click="zoomOutCalibration" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">-</button>
                <span class="text-xs text-gray-500 min-w-[3.2rem] text-center">{{ Math.round(calibrationZoom * 100) }}%</span>
                <button @click="zoomInCalibration" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">+</button>
              </div>
            </div>
            <p class="text-[11px] text-gray-500">
              Cara kalibrasi cepat: pilih mode Move/Resize. Gunakan tombol Drag pada rail atas untuk geser blok. Pada mode Resize, pakai titik merah untuk ubah ukuran, lalu handle guide di rail atas untuk atur kolom/baris/split tanpa menyentuh area dalam blok (lebih nyaman di touchscreen).
            </p>

            <div class="flex items-center gap-2 flex-wrap justify-between">
              <div class="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
                <button
                  type="button"
                  @click="calibrationTouchMode = 'move'"
                  :class="[
                    'px-2 py-1 text-[11px] font-semibold rounded transition-colors',
                    calibrationTouchMode === 'move' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  Move
                </button>
                <button
                  type="button"
                  @click="calibrationTouchMode = 'resize'"
                  :class="[
                    'px-2 py-1 text-[11px] font-semibold rounded transition-colors',
                    calibrationTouchMode === 'resize' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  Resize
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-gray-400">Step</span>
                <select v-model.number="calibrationStep" class="text-xs border border-gray-200 rounded-md px-2 py-1">
                  <option :value="0.005">0.005</option>
                  <option :value="0.01">0.01</option>
                  <option :value="0.02">0.02</option>
                </select>
              </div>
            </div>

            <div v-if="calibrationImageSrc" class="rounded-lg border border-gray-200 bg-white overflow-auto max-h-[78vh] lg:max-h-[82vh]">
              <div ref="calibrationStageRef" class="relative touch-none" :style="calibrationStageStyle" @pointermove="onCalibrationPointerMove" @pointerup="onCalibrationPointerUp" @pointercancel="onCalibrationPointerUp" @click="() => { calibrationContextMenu.visible = false }">
                <img :src="calibrationImageSrc" alt="Calibration" class="block w-full h-auto select-none" draggable="false" />

                <!-- Grid Overlay SVG -->
                <svg v-if="calibrationImageSrc" class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <g stroke="#94a3b8" stroke-width="1.35" opacity="0.95">
                    <line v-for="i in calibrationGlobalCols - 1" :key="`gv-${i}`" :x1="`${(i / calibrationGlobalCols) * 100}%`" y1="0" :x2="`${(i / calibrationGlobalCols) * 100}%`" y2="100%" />
                    <line v-for="i in calibrationGlobalRows - 1" :key="`gh-${i}`" x1="0" :y1="`${(i / calibrationGlobalRows) * 100}%`" x2="100%" :y2="`${(i / calibrationGlobalRows) * 100}%`" />
                  </g>

                  <g v-for="(block, idx) in scanCalibration.blocks" :key="`grid-${idx}`">
                    <rect
                      :x="`${Number(block.x || 0) * 100}%`"
                      :y="`${Number(block.y || 0) * 100}%`"
                      :width="`${Number(block.w || 0) * 100}%`"
                      :height="`${Number(block.h || 0) * 100}%`"
                      :fill="selectedCalibrationBlockIndex === idx ? 'rgba(20,184,166,0.06)' : 'rgba(245,158,11,0.04)'"
                      :stroke="selectedCalibrationBlockIndex === idx ? '#0d9488' : '#f59e0b'"
                      stroke-width="2.4"
                    />

                    <g stroke="#475569" stroke-width="1.25" opacity="0.95">
                      <line
                        v-for="guide in getRowGuideRatios(block)"
                        :key="`block-row-${idx}-${guide.bandIndex}`"
                        :x1="`${Number(block.x || 0) * 100}%`"
                        :y1="`${(Number(block.y || 0) + (Number(block.h || 0) * guide.ratio)) * 100}%`"
                        :x2="`${(Number(block.x || 0) + Number(block.w || 0)) * 100}%`"
                        :y2="`${(Number(block.y || 0) + (Number(block.h || 0) * guide.ratio)) * 100}%`"
                      />
                      <line
                        v-for="guide in getColGuideRatios(block)"
                        :key="`block-col-${idx}-${guide.bandIndex}`"
                        :x1="`${(Number(block.x || 0) + (Number(block.w || 0) * guide.ratio)) * 100}%`"
                        :y1="`${Number(block.y || 0) * 100}%`"
                        :x2="`${(Number(block.x || 0) + (Number(block.w || 0) * guide.ratio)) * 100}%`"
                        :y2="`${(Number(block.y || 0) + Number(block.h || 0)) * 100}%`"
                      />
                    </g>

                    <text
                      :x="`${(Number(block.x || 0) + 0.006) * 100}%`"
                      :y="`${(Number(block.y || 0) + 0.014) * 100}%`"
                      font-size="9"
                      font-weight="700"
                      :fill="selectedCalibrationBlockIndex === idx ? '#0d9488' : '#b45309'"
                    >
                      Blok {{ idx + 1 }} · Q{{ block.startQ }}-{{ block.startQ + block.count - 1 }}
                    </text>

                    <text
                      v-for="q in Number(block.count || 0)"
                      :key="`row-no-${idx}-${q}`"
                      :x="`${(Number(block.x || 0) + 0.002) * 100}%`"
                      :y="`${(Number(block.y || 0) + (Number(block.h || 0) * ((q - 0.5) / Number(block.count || 1)))) * 100}%`"
                      font-size="7"
                      :fill="selectedCalibrationBlockIndex === idx ? '#0f766e' : '#6b7280'"
                    >
                      {{ Number(block.startQ || 1) + q - 1 }}
                    </text>
                  </g>
                </svg>

                <!-- Interactive block overlays (drag + easy resize handles) -->
                <div
                  v-for="(block, idx) in scanCalibration.blocks"
                  :key="`overlay-${idx}`"
                  :style="calibrationBlockStyle(block, idx)"
                  class="calibration-block absolute rounded border-2 touch-none"
                  @dblclick="handleCalibrationBlockDoubleClick(idx)"
                  @pointerdown="handleCalibrationBlockLongPress(idx, $event)"
                  @pointerup="clearLongPressTimer"
                  @pointercancel="clearLongPressTimer"
                >
                  <div class="top-guide-rail">
                    <button
                      v-if="calibrationTouchMode === 'move'"
                      type="button"
                      class="move-handle"
                      @pointerdown.stop.prevent="onMoveHandlePointerDown(idx, $event)"
                    >
                      Drag B{{ idx + 1 }}
                    </button>

                    <button
                      v-if="calibrationTouchMode === 'resize'"
                      type="button"
                      class="guide-handle split top"
                      :style="{ left: `${getBlockSplitRatio(block) * 100}%` }"
                      @pointerdown.stop.prevent="onGuideHandlePointerDown(idx, 'split', 0, $event)"
                    ></button>

                    <button
                      v-if="calibrationTouchMode === 'resize'"
                      v-for="guide in getColGuideRatios(block)"
                      :key="`col-guide-handle-top-${idx}-${guide.bandIndex}`"
                      type="button"
                      class="guide-handle col top"
                      :style="{ left: `${guide.ratio * 100}%` }"
                      @pointerdown.stop.prevent="onGuideHandlePointerDown(idx, 'col', guide.bandIndex, $event)"
                    ></button>
                  </div>

                  <div class="left-guide-rail">
                    <button
                      v-if="calibrationTouchMode === 'resize'"
                      v-for="guide in getRowGuideRatios(block)"
                      :key="`row-guide-handle-left-${idx}-${guide.bandIndex}`"
                      type="button"
                      class="guide-handle row left"
                      :style="{ top: `${guide.ratio * 100}%` }"
                      @pointerdown.stop.prevent="onGuideHandlePointerDown(idx, 'row', guide.bandIndex, $event)"
                    ></button>
                  </div>

                  <div class="pointer-events-none absolute inset-0">
                    <div
                      v-for="col in getBlockColLabelCenters(block)"
                      :key="`col-badge-${idx}-${col.colIndex}`"
                      class="calib-col-badge"
                      :style="{ left: `${col.ratio * 100}%` }"
                    >
                      {{ col.label }}
                    </div>
                    <div
                      v-for="row in getBlockRowLabelCenters(block)"
                      :key="`row-badge-${idx}-${row.rowIndex}`"
                      class="calib-row-badge"
                      :style="{ top: `${row.ratio * 100}%` }"
                    >
                      {{ row.qn }}
                    </div>
                  </div>

                  <div class="pointer-events-none text-[10px] font-semibold px-1 py-0.5" :class="selectedCalibrationBlockIndex === idx ? 'text-teal-700' : 'text-amber-700'">
                    B{{ idx + 1 }}
                  </div>

                  <template v-if="calibrationTouchMode === 'resize'">
                    <button type="button" class="resize-handle corner nw" @pointerdown="onResizeHandlePointerDown(idx, 'nw', $event)"></button>
                    <button type="button" class="resize-handle corner ne" @pointerdown="onResizeHandlePointerDown(idx, 'ne', $event)"></button>
                    <button type="button" class="resize-handle corner sw" @pointerdown="onResizeHandlePointerDown(idx, 'sw', $event)"></button>
                    <button type="button" class="resize-handle corner se" @pointerdown="onResizeHandlePointerDown(idx, 'se', $event)"></button>

                    <button type="button" class="resize-handle edge n" @pointerdown="onResizeHandlePointerDown(idx, 'n', $event)"></button>
                    <button type="button" class="resize-handle edge e" @pointerdown="onResizeHandlePointerDown(idx, 'e', $event)"></button>
                    <button type="button" class="resize-handle edge s" @pointerdown="onResizeHandlePointerDown(idx, 's', $event)"></button>
                    <button type="button" class="resize-handle edge w" @pointerdown="onResizeHandlePointerDown(idx, 'w', $event)"></button>
                  </template>
                </div>
              </div>

              <!-- Dimension Tooltip -->
              <div v-if="calibrationDimensionTooltip.visible" class="dimension-tooltip" :style="{ left: `${calibrationDimensionTooltip.x}px`, top: `${calibrationDimensionTooltip.y}px` }">
                {{ calibrationDimensionTooltip.text }}
              </div>

              <!-- Context Menu -->
              <div v-if="calibrationContextMenu.visible" class="calibration-context-menu" :style="{ left: `${calibrationContextMenu.x}px`, top: `${calibrationContextMenu.y}px` }">
                <button @click="handleContextMenuAction('reset')">Reset ke Default</button>
                <button @click="handleContextMenuAction('autofit')">Auto-Fit Ukuran</button>
                <button @click="handleContextMenuAction('lockAspect')">{{ calibrationAspectLocked ? '🔒 Unlock Aspect' : '🔓 Lock Aspect' }}</button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Pilih foto lembar jawab dulu agar overlay bisa digeser langsung.</p>
          </div>

          <div v-if="selectedCalibrationBlock" class="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-gray-700">Atur Blok {{ selectedCalibrationBlockIndex + 1 }} · Q{{ selectedCalibrationBlock.startQ }}-{{ selectedCalibrationBlock.startQ + selectedCalibrationBlock.count - 1 }}</p>
              <button
                type="button"
                @click="calibrationSlidersEnabled = !calibrationSlidersEnabled"
                :class="calibrationSlidersEnabled ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'"
                class="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors"
              >{{ calibrationSlidersEnabled ? '🔓 Slider Aktif' : '🔒 Slider Terkunci' }}</button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-3">
              <div class="rounded-lg border border-gray-200 bg-white p-2.5 space-y-2">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Baris</p>
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] text-gray-500 flex items-center gap-1">
                      <input v-model="calibrationAspectLocked" type="checkbox" class="rounded" />
                      Lock Aspect
                    </label>
                    <button @click="handleContextMenuAction('autofit')" class="rounded px-2 py-1 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">Auto-fit</button>
                  </div>
                </div>
                <div>
                  <label class="text-[10px] text-gray-500 block mb-1">Top: {{ (selectedCalibrationBlock?.rowTop * 100).toFixed(1) }}%</label>
                  <input v-model.number="selectedCalibrationBlock.rowTop" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'rowTop', e.target.value)" type="range" step="0.005" min="0" max="0.9" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                </div>
                <div>
                  <label class="text-[10px] text-gray-500 block mb-1">Bottom: {{ (selectedCalibrationBlock?.rowBottom * 100).toFixed(1) }}%</label>
                  <input v-model.number="selectedCalibrationBlock.rowBottom" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'rowBottom', e.target.value)" type="range" step="0.005" min="0.1" max="1" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                </div>
                <div>
                  <label class="text-[10px] text-gray-500 block mb-1">Height: {{ (selectedCalibrationBlock?.h * 100).toFixed(1) }}%</label>
                  <input v-model.number="selectedCalibrationBlock.h" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'h', e.target.value)" type="range" step="0.01" min="0.01" max="1" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3">
                <div class="rounded-lg border border-gray-200 bg-white p-2.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Lebar Kolom</p>
                    <div class="flex gap-1">
                      <button @click="quickAdjustBlock('questionColW', -5)" class="rounded px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200">-5%</button>
                      <button @click="quickAdjustBlock('questionColW', 5)" class="rounded px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200">+5%</button>
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] text-gray-500 block mb-1">Blok: {{ (selectedCalibrationBlock?.questionColW * 100).toFixed(1) }}%</label>
                    <input v-model.number="selectedCalibrationBlock.questionColW" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'questionColW', e.target.value)" type="range" step="0.005" min="0.02" max="0.3" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                  </div>
                  <div>
                    <label class="text-[10px] text-gray-500 block mb-1">Global: {{ (scanCalibration.questionColW * 100).toFixed(1) }}%</label>
                    <input v-model.number="scanCalibration.questionColW" @input="(e) => { scanCalibration.questionColW = Number(clamp(Number(e.target.value), 0.02, 0.3).toFixed(4)) }" type="range" step="0.005" min="0.02" max="0.3" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                  </div>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white p-2.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <p class="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Gap (Jarak)</p>
                    <div class="flex gap-1">
                      <button @click="quickAdjustBlock('centerPadX', -10)" class="rounded px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200">-10%</button>
                      <button @click="quickAdjustBlock('centerPadX', 10)" class="rounded px-1.5 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200">+10%</button>
                    </div>
                  </div>
                  <div>
                    <label class="text-[10px] text-gray-500 block mb-1">Horizontal: {{ (scanCalibration.centerPadX * 100).toFixed(1) }}%</label>
                    <input v-model.number="scanCalibration.centerPadX" @input="(e) => { scanCalibration.centerPadX = Number(clamp(Number(e.target.value), 0, 0.5).toFixed(4)) }" type="range" step="0.005" min="0" max="0.5" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                  </div>
                  <div>
                    <label class="text-[10px] text-gray-500 block mb-1">Vertikal: {{ (scanCalibration.centerPadY * 100).toFixed(1) }}%</label>
                    <input v-model.number="scanCalibration.centerPadY" @input="(e) => { scanCalibration.centerPadY = Number(clamp(Number(e.target.value), 0, 0.5).toFixed(4)) }" type="range" step="0.005" min="0" max="0.5" :disabled="!calibrationSlidersEnabled" class="w-full calib-slider" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label class="text-[10px] text-gray-400">X: {{ (selectedCalibrationBlock?.x * 100).toFixed(1) }}%</label>
                <input v-model.number="selectedCalibrationBlock.x" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'x', e.target.value)" type="range" step="0.01" min="0" max="1" :disabled="!calibrationSlidersEnabled" class="mt-0.5 w-full calib-slider" />
              </div>
              <div>
                <label class="text-[10px] text-gray-400">Y: {{ (selectedCalibrationBlock?.y * 100).toFixed(1) }}%</label>
                <input v-model.number="selectedCalibrationBlock.y" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'y', e.target.value)" type="range" step="0.01" min="0" max="1" :disabled="!calibrationSlidersEnabled" class="mt-0.5 w-full calib-slider" />
              </div>
              <div>
                <label class="text-[10px] text-gray-400">W: {{ (selectedCalibrationBlock?.w * 100).toFixed(1) }}%</label>
                <input v-model.number="selectedCalibrationBlock.w" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'w', e.target.value)" type="range" step="0.01" min="0.01" max="1" :disabled="!calibrationSlidersEnabled" class="mt-0.5 w-full calib-slider" />
              </div>
              <div>
                <label class="text-[10px] text-gray-400">H: {{ (selectedCalibrationBlock?.h * 100).toFixed(1) }}%</label>
                <input v-model.number="selectedCalibrationBlock.h" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'h', e.target.value)" type="range" step="0.01" min="0.01" max="1" :disabled="!calibrationSlidersEnabled" class="mt-0.5 w-full calib-slider" />
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label class="text-[10px] text-gray-400">rowTop</label>
                <input v-model.number="selectedCalibrationBlock.rowTop" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'rowTop', e.target.value)" type="number" step="0.01" min="0" max="0.9" class="mt-0.5 w-full text-xs border border-gray-200 rounded px-2 py-1" />
              </div>
              <div>
                <label class="text-[10px] text-gray-400">rowBottom</label>
                <input v-model.number="selectedCalibrationBlock.rowBottom" @input="(e) => adjustBlockSlider(selectedCalibrationBlock, 'rowBottom', e.target.value)" type="number" step="0.01" min="0.1" max="1" class="mt-0.5 w-full text-xs border border-gray-200 rounded px-2 py-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>

    <!-- Scan Mode Tabs -->
    <div class="flex gap-2 bg-gray-100 rounded-xl p-1">
      <button v-for="mode in scanModes" :key="mode.key"
        @click="activeScanMode = mode.key"
        :class="[
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
          activeScanMode === mode.key
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ]">
        <SvgIcon :name="mode.icon" :size="16" />
        <span>{{ mode.label }}</span>
      </button>
    </div>

    <!-- === CAMERA MODE === -->
    <div v-if="activeScanMode === 'camera'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        
        <!-- Camera Preview / Drop Zone -->
        <div v-if="!previewSrc" class="p-4 space-y-3 bg-gray-50">
          <div
            v-if="!liveCameraActive"
            @click="triggerCamera"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
            :class="[
              'relative flex flex-col items-center justify-center gap-4 cursor-pointer transition-all rounded-xl',
              'min-h-[220px] sm:min-h-[260px]',
              dragOver ? 'bg-primary/5 border-2 border-dashed border-primary' : 'bg-white border border-gray-100'
            ]"
          >
            <div class="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-gray-100">
              <SvgIcon name="photo" :size="28" class="text-primary" />
            </div>
            <div class="text-center px-6">
              <p class="font-semibold text-gray-800">Ambil Foto Lembar Jawab</p>
              <p class="text-sm text-gray-400 mt-1">Tap untuk kamera file atau drag-drop gambar</p>
            </div>
          </div>

          <div v-else class="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
            <video ref="liveCameraVideoRef" autoplay playsinline muted class="w-full max-h-[420px] object-contain"></video>
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div class="absolute border-2 border-dashed border-emerald-300/90 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.22)] transition-all duration-150" :style="liveFrameGuideStyle"></div>
            </div>
            <div class="absolute top-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[10px] text-white border border-white/15">
              Auto Align {{ liveAutoAlignEnabled ? 'ON' : 'OFF' }}
              <span v-if="liveAutoAlignEnabled" class="text-emerald-200"> · {{ Math.round(liveAutoFrameConfidence * 100) }}%</span>
            </div>
            <div v-if="liveOverlayBlocks.length" class="absolute inset-0 pointer-events-none">
              <div
                v-for="block in liveOverlayBlocks"
                :key="block.idx"
                class="absolute rounded-lg border border-white/20 bg-white/5 backdrop-blur-[1px] overflow-hidden"
                :style="block.style"
              >
                <div class="flex items-center justify-between gap-2 px-2 py-1 text-[9px] font-semibold text-white bg-black/35 border-b border-white/10">
                  <span>Q{{ block.startQ }}-{{ block.startQ + block.count - 1 }}</span>
                  <span>{{ block.rows.filter((row) => row.state !== 'blank' && row.state !== 'pending').length }}/{{ block.rows.length }}</span>
                </div>
                <div class="h-[calc(100%-1.4rem)] grid grid-cols-1 gap-px bg-white/10 overflow-hidden">
                  <div
                    v-for="row in block.rows"
                    :key="row.qn"
                    :class="[
                      'min-h-0 px-1 py-0.5 text-[9px] leading-tight flex items-center justify-between gap-1',
                      row.state === 'correct'
                        ? 'bg-emerald-500/60 text-white'
                        : row.state === 'wrong'
                          ? 'bg-rose-500/65 text-white'
                          : row.state === 'blank'
                            ? 'bg-black/35 text-white/70'
                            : 'bg-amber-500/65 text-white'
                    ]"
                  >
                    <span>Q{{ row.qn }}</span>
                    <span class="font-semibold">{{ row.detected }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="liveDetectQuestionMarks.length" class="absolute top-2 right-2 bottom-2 w-[34%] min-w-[160px] max-w-[220px] pointer-events-none">
              <div class="h-full rounded-xl border border-white/20 bg-black/45 backdrop-blur-sm overflow-hidden shadow-lg">
                <div class="px-2 py-1.5 border-b border-white/10 text-[10px] font-semibold text-white/90 flex items-center justify-between gap-2">
                  <span>Live Frame</span>
                  <span class="text-white/60">{{ liveDetectQuestionMarks.length }} item</span>
                </div>
                <div class="h-[calc(100%-2rem)] overflow-hidden">
                  <div class="h-full overflow-y-auto px-2 py-2 space-y-1.5">
                    <div
                      v-for="mark in liveDetectQuestionMarks"
                      :key="mark.qn"
                      :class="[
                        'rounded-lg border px-2 py-1 text-[10px] leading-tight transition-colors',
                        mark.state === 'correct'
                          ? 'bg-emerald-500/20 border-emerald-300/40 text-emerald-50'
                          : mark.state === 'wrong'
                            ? 'bg-rose-500/20 border-rose-300/40 text-rose-50'
                            : mark.state === 'blank'
                              ? 'bg-white/8 border-white/15 text-white/75'
                              : 'bg-amber-500/20 border-amber-300/40 text-amber-50'
                      ]"
                    >
                      <div class="flex items-center justify-between gap-2 font-semibold">
                        <span>Q{{ mark.qn }}</span>
                        <span>{{ mark.detected }}</span>
                      </div>
                      <div class="mt-0.5 flex items-center justify-between gap-2 text-[9px] opacity-85">
                        <span>{{ mark.expected || 'expected -' }}</span>
                        <span>{{ mark.state }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute left-2 right-2 bottom-2 space-y-1">
              <div class="rounded-md bg-black/60 text-white text-[11px] px-2 py-1 backdrop-blur-sm">
                {{ liveDetectStatusText }}
              </div>
              <div class="rounded-md bg-black/45 text-white text-[10px] px-2 py-1 backdrop-blur-sm break-words">
                {{ liveDetectPreview || 'Arahkan lembar jawaban ke kotak hijau lalu tunggu deteksi otomatis.' }}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="startLiveCamera"
              :disabled="liveCameraLoading || liveCameraActive"
              class="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {{ liveCameraLoading ? 'Membuka kamera...' : 'Buka Kamera Live' }}
            </button>
            <button
              v-if="liveCameraActive"
              type="button"
              @click="captureLiveCameraFrame"
              class="px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
            >
              Capture Untuk Scan
            </button>
            <button
              v-if="liveCameraActive"
              type="button"
              @click="stopLiveCamera"
              class="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Tutup Kamera Live
            </button>
            <button
              type="button"
              @click="triggerCamera"
              class="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Pilih Dari Kamera/File
            </button>
            <label
              v-if="liveCameraActive"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
            >
              <input v-model="liveDetectEnabled" type="checkbox" class="accent-primary" />
              Live Detect
            </label>
            <label
              v-if="liveCameraActive"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
            >
              <input v-model="liveAutoAlignEnabled" type="checkbox" class="accent-primary" />
              Auto Align Zoom
            </label>
          </div>

          <div v-if="liveCameraActive" class="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800">
            <p class="font-semibold">{{ liveDetectStatusText }}</p>
            <p v-if="liveDetectPreview" class="mt-1 text-emerald-700 break-words">{{ liveDetectPreview }}</p>
          </div>

          <div
            v-if="liveCameraActive && liveLightingQuality && liveLightingQuality.quality !== 'good'"
            class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          >
            Cahaya kurang merata/gelap terdeteksi. Sistem sudah auto-enhance, tetapi hasil terbaik tetap dengan lampu lebih terang dan hindari bayangan tangan.
          </div>

          <p v-if="liveDetectError" class="text-xs text-amber-600">{{ liveDetectError }}</p>

          <p v-if="liveCameraError" class="text-xs text-red-500">{{ liveCameraError }}</p>

          <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFileSelected" />
        </div>

        <!-- Image Preview -->
        <div v-else class="relative">
          <img :src="previewSrc" class="w-full max-h-[420px] object-contain bg-gray-900" alt="Preview" />
          <button @click="clearPreview"
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <SvgIcon name="close" :size="14" />
          </button>
        </div>

        <!-- Scan Button -->
        <div v-if="previewSrc" class="p-4 border-t border-gray-100">
          <button @click="doScan" :disabled="scanning"
            class="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base font-semibold rounded-xl disabled:opacity-60">
            <span v-if="scanning" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <SvgIcon v-else name="document" :size="18" />
            {{ scanning ? 'Memproses...' : 'Scan Sekarang' }}
          </button>
        </div>
      </div>
    </div>

    <!-- === UPLOAD MODE === -->
    <div v-else-if="activeScanMode === 'upload'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        
        <div v-if="uploadFiles.length === 0"
          @click="triggerUpload"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="onDropMultiple"
          :class="[
            'relative flex flex-col items-center justify-center gap-4 cursor-pointer transition-all min-h-[220px]',
            dragOver ? 'bg-primary/5 border-2 border-dashed border-primary' : 'bg-gray-50'
          ]">
          <div class="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center border border-gray-100">
            <SvgIcon name="download" :size="24" class="text-primary rotate-180" />
          </div>
          <div class="text-center px-6">
            <p class="font-semibold text-gray-800">Upload Banyak Gambar</p>
            <p class="text-sm text-gray-400 mt-1">Pilih satu atau lebih file gambar</p>
          </div>
          <input ref="uploadInput" type="file" accept="image/*" multiple class="hidden" @change="onMultipleFilesSelected" />
        </div>

        <!-- File list -->
        <div v-else class="p-4 space-y-2">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-gray-700">{{ uploadFiles.length }} file dipilih</span>
            <button @click="clearUploadFiles" class="text-xs text-red-500 hover:underline">Hapus semua</button>
          </div>
          <div v-for="(f, i) in uploadFiles" :key="i"
            class="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <SvgIcon name="photo" :size="14" class="text-primary" />
            </div>
            <span class="text-sm text-gray-700 truncate flex-1">{{ f.name }}</span>
            <span class="text-xs text-gray-400 shrink-0">{{ formatFileSize(f.size) }}</span>
          </div>
          <button @click="doScanBulk" :disabled="scanning"
            class="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-2 text-base font-semibold rounded-xl disabled:opacity-60">
            <span v-if="scanning" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            <SvgIcon v-else name="document" :size="18" />
            {{ scanning ? 'Memproses ' + scanProgress + '%...' : `Scan ${uploadFiles.length} Gambar` }}
          </button>
        </div>
      </div>
    </div>

    <!-- === SCANNER HARDWARE MODE === -->
    <div v-else-if="activeScanMode === 'scanner'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700">Perangkat Scanner</span>
          <button @click="loadScannerDevices" :disabled="loadingDevices"
            class="text-xs text-primary hover:underline disabled:opacity-50">
            {{ loadingDevices ? 'Memuat...' : 'Refresh' }}
          </button>
        </div>
        <div v-if="scannerDevices.length === 0" class="text-sm text-gray-400 italic">
          Tidak ada scanner terdeteksi. Pastikan driver terpasang.
        </div>
        <div v-else class="space-y-2">
          <button v-for="d in scannerDevices" :key="d.id"
            @click="selectedScannerId = d.id"
            :class="[
              'w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all',
              selectedScannerId === d.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            ]">
            <div :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              selectedScannerId === d.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            ]">
              <SvgIcon name="document" :size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ d.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ d.id }}</p>
            </div>
          </button>
        </div>
        <button @click="doHardwareScan" :disabled="scanning || !selectedScannerId"
          class="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base font-semibold rounded-xl disabled:opacity-60">
          <span v-if="scanning" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <SvgIcon v-else name="document" :size="18" />
          {{ scanning ? 'Memindai...' : 'Scan dengan Scanner' }}
        </button>
      </div>
    </div>

    <!-- Scan Error -->
    <div v-if="scanError" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <SvgIcon name="close" :size="18" class="text-red-500 mt-0.5 shrink-0" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-red-700">Gagal memproses</p>
        <p class="text-xs text-red-600 mt-0.5 whitespace-pre-wrap">{{ scanError }}</p>
      </div>
      <button @click="scanError = null" class="text-red-400 hover:text-red-600 shrink-0">
        <SvgIcon name="close" :size="14" />
      </button>
    </div>

    <div v-if="saveFailures.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <SvgIcon name="document" :size="18" class="text-amber-600 mt-0.5 shrink-0" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-amber-800">Sebagian hasil belum tersimpan</p>
        <p class="text-xs text-amber-700 mt-0.5">{{ saveFailures.length }} data gagal disimpan. Hasil scan tetap aman, tap Coba Lagi untuk sinkron ulang.</p>
      </div>
      <button @click="retryFailedSaves" :disabled="retryingSaves" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-60">
        {{ retryingSaves ? 'Mencoba...' : 'Coba Lagi' }}
      </button>
    </div>

    <div v-if="saveSuccessMessage" class="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
      {{ saveSuccessMessage }}
    </div>

    <div v-if="mappingSuccessMessage" class="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
      {{ mappingSuccessMessage }}
    </div>

    <!-- Scan Result -->
    <transition name="fade-up">
      <div v-if="lastResult" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-800">Hasil Scan</h2>
          <button @click="lastResult = null" class="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
        </div>

        <!-- Score Card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5">
          <div class="flex items-center gap-4 mb-4">
            <div :class="[
              'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0',
              scoreGrade(lastResult.score) === 'A' ? 'bg-green-100 text-green-700' :
              scoreGrade(lastResult.score) === 'B' ? 'bg-blue-100 text-blue-700' :
              scoreGrade(lastResult.score) === 'C' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            ]">
              {{ scoreGrade(lastResult.score) }}
            </div>
            <div class="flex-1">
              <div class="text-3xl font-bold text-gray-900">{{ lastResult.score ?? '–' }}<span class="text-base font-normal text-gray-400">/100</span></div>
              <div class="flex gap-3 mt-1 text-sm">
                <span class="text-green-600 font-medium">✓ {{ lastResult.correct ?? 0 }} benar</span>
                <span class="text-red-500 font-medium">✗ {{ lastResult.wrong ?? 0 }} salah</span>
                <span v-if="lastResult.blank" class="text-gray-400">– {{ lastResult.blank }} kosong</span>
              </div>
            </div>
          </div>

          <div class="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
              Mode: {{ formatScanMethod(lastResult.method) }}
            </span>
            <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              Section: {{ formatLJKSection(lastResult.sectionInfo?.section) }}
            </span>
            <span v-if="lastResult.sectionInfo?.visibleBlockCount" class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-semibold text-gray-600">
              Blok terlihat: {{ lastResult.sectionInfo.visibleBlockCount }}
            </span>
          </div>

          <div class="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Integrasi Data</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                <p class="text-[11px] uppercase tracking-wide text-gray-400">Pelajaran</p>
                <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(lastResult).lessonName || 'Belum dipilih' }}</p>
              </div>
              <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                <p class="text-[11px] uppercase tracking-wide text-gray-400">Kelas</p>
                <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(lastResult).className || 'Belum dipilih' }}</p>
              </div>
              <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                <p class="text-[11px] uppercase tracking-wide text-gray-400">Guru</p>
                <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(lastResult).teacherName || 'Belum dipilih' }}</p>
              </div>
            </div>

            <div class="mt-3 rounded-lg bg-white border border-gray-100 p-3">
              <p class="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Daftar Santri Kelas ({{ getResultContext(lastResult).students.length }})</p>
              <div v-if="getResultContext(lastResult).students.length" class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                <div v-for="(s, idx) in getResultContext(lastResult).students" :key="s.id || idx"
                  class="flex items-center justify-between gap-2 text-sm rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                  <span class="font-medium text-gray-700 truncate">{{ studentLabel(s) }}</span>
                  <span class="text-[11px] text-gray-400">#{{ idx + 1 }}</span>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400 italic">Belum ada data santri untuk kelas ini.</p>

              <div v-if="getResultContext(lastResult).students.length" class="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <select
                  :value="selectedStudentByResult[getResultBufferKey(lastResult)] ?? ''"
                  class="sm:col-span-9 w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs"
                  @change="onStudentSelectionChange(getResultBufferKey(lastResult), $event.target.value)"
                >
                  <option value="">Pilih santri untuk simpan langsung</option>
                  <option v-for="student in getResultContext(lastResult).students" :key="student.id" :value="student.id">
                    {{ studentLabel(student) }}
                  </option>
                </select>

                <button
                  class="sm:col-span-3 px-2.5 py-2 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-60"
                  :disabled="!selectedStudentByResult[getResultBufferKey(lastResult)] || mappingLoadingByResult[getResultBufferKey(lastResult)]"
                  @click="assignStudentToResult(lastResult, 'scan')"
                >
                  {{ mappingLoadingByResult[getResultBufferKey(lastResult)] ? 'Menyimpan...' : 'Simpan Santri' }}
                </button>
              </div>
              <p v-if="mappingErrorByResult[getResultBufferKey(lastResult)]" class="mt-2 text-[11px] text-red-500">
                {{ mappingErrorByResult[getResultBufferKey(lastResult)] }}
              </p>
            </div>
          </div>

          <!-- Answers Grid -->
          <div v-if="lastResult.answers?.length" class="mt-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Jawaban</p>
            <div class="grid grid-cols-5 gap-1.5">
              <div v-for="(ans, idx) in lastResult.answers" :key="idx"
                :class="[
                  'rounded-lg py-2 text-center text-sm font-bold border',
                  ans.correct === true ? 'bg-green-50 border-green-200 text-green-700' :
                  ans.correct === false ? 'bg-red-50 border-red-200 text-red-700' :
                  'bg-gray-50 border-gray-200 text-gray-400'
                ]">
                <div class="text-[10px] text-gray-400 leading-none">{{ idx + 1 }}</div>
                <select
                  :value="ans.detected || ''"
                  @change="onManualAnswerChange(lastResult, idx, $event.target.value)"
                  class="mt-1 w-full rounded border border-gray-200 bg-white px-1 py-0.5 text-[11px] font-semibold text-gray-700"
                >
                  <option value="">-</option>
                  <option v-for="label in activeOptionLabels" :key="label" :value="label">{{ label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div v-else-if="lastResult.rawText" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Fallback OCR Text</p>
            <p class="text-xs text-amber-800 mt-1 whitespace-pre-wrap">{{ lastResult.rawText }}</p>
          </div>

          <!-- Scanned image thumbnail -->
          <div v-if="lastResult.previewUrl || lastResultPreview" class="mt-4 border-t border-gray-100 pt-4">
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
              <button @click="openResultPreview(lastResult.previewUrl || lastResultPreview)" class="text-xs font-semibold text-primary hover:underline">Perbesar</button>
            </div>
            <button @click="openResultPreview(lastResult.previewUrl || lastResultPreview)" class="block w-full">
              <img :src="lastResult.previewUrl || lastResultPreview"
                class="rounded-xl max-h-72 w-full object-contain bg-gray-50 border border-gray-100" />
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bulk Results -->
    <transition name="fade-up">
      <div v-if="bulkResults.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-gray-800">Hasil Bulk Scan ({{ bulkResults.length }})</h2>
          <button @click="bulkResults = []" class="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
        </div>
        
        <div class="space-y-3">
          <div v-for="(res, i) in bulkResults" :key="i"
            class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 space-y-3">
            <div class="flex items-center gap-4">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0',
              res.error ? 'bg-red-100 text-red-600' :
              scoreGrade(res.score) === 'A' ? 'bg-green-100 text-green-700' :
              scoreGrade(res.score) === 'B' ? 'bg-blue-100 text-blue-700' :
              scoreGrade(res.score) === 'C' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            ]">
              {{ res.error ? '!' : scoreGrade(res.score) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ res.filename || `File ${i + 1}` }}</p>
              <p v-if="res.error" class="text-xs text-red-500 mt-0.5">{{ res.error }}</p>
              <p v-else class="text-xs text-gray-500 mt-0.5">
                Skor: <strong>{{ res.score ?? '–' }}</strong> · ✓ {{ res.correct }} · ✗ {{ res.wrong }}
              </p>
            </div>
            <div v-if="!res.error" class="text-xl font-bold" :class="[
              scoreGrade(res.score) === 'A' ? 'text-green-600' :
              scoreGrade(res.score) === 'B' ? 'text-blue-600' :
              scoreGrade(res.score) === 'C' ? 'text-yellow-600' :
              'text-red-600'
            ]">{{ res.score ?? '–' }}</div>
            </div>

            <div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                  <p class="text-[11px] uppercase tracking-wide text-gray-400">Pelajaran</p>
                  <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(res).lessonName || 'Belum dipilih' }}</p>
                </div>
                <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                  <p class="text-[11px] uppercase tracking-wide text-gray-400">Kelas</p>
                  <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(res).className || 'Belum dipilih' }}</p>
                </div>
                <div class="rounded-lg bg-white border border-gray-100 px-3 py-2">
                  <p class="text-[11px] uppercase tracking-wide text-gray-400">Guru</p>
                  <p class="font-semibold text-gray-800 mt-0.5">{{ getResultContext(res).teacherName || 'Belum dipilih' }}</p>
                </div>
              </div>

              <details class="mt-3 rounded-lg bg-white border border-gray-100 p-2.5">
                <summary class="text-xs font-semibold text-gray-600 cursor-pointer">Daftar Santri Kelas ({{ getResultContext(res).students.length }})</summary>
                <div v-if="getResultContext(res).students.length" class="max-h-36 overflow-y-auto space-y-1.5 pr-1 mt-2">
                  <div v-for="(s, idx) in getResultContext(res).students" :key="s.id || idx"
                    class="flex items-center justify-between gap-2 text-sm rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                    <span class="font-medium text-gray-700 truncate">{{ studentLabel(s) }}</span>
                    <span class="text-[11px] text-gray-400">#{{ idx + 1 }}</span>
                  </div>
                </div>
                <p v-else class="text-xs text-gray-400 italic mt-2">Belum ada data santri untuk kelas ini.</p>

                <div v-if="getResultContext(res).students.length" class="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    :value="selectedStudentByResult[getResultBufferKey(res, i)] ?? ''"
                    class="sm:col-span-9 w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs"
                    @change="onStudentSelectionChange(getResultBufferKey(res, i), $event.target.value)"
                  >
                    <option value="">Pilih santri untuk simpan langsung</option>
                    <option v-for="student in getResultContext(res).students" :key="student.id" :value="student.id">
                      {{ studentLabel(student) }}
                    </option>
                  </select>

                  <button
                    class="sm:col-span-3 px-2.5 py-2 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-60"
                    :disabled="!selectedStudentByResult[getResultBufferKey(res, i)] || mappingLoadingByResult[getResultBufferKey(res, i)]"
                    @click="assignStudentToResult(res, 'scan-bulk', i)"
                  >
                    {{ mappingLoadingByResult[getResultBufferKey(res, i)] ? 'Menyimpan...' : 'Simpan Santri' }}
                  </button>
                </div>
                <p v-if="mappingErrorByResult[getResultBufferKey(res, i)]" class="mt-2 text-[11px] text-red-500">
                  {{ mappingErrorByResult[getResultBufferKey(res, i)] }}
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Persisted Integrated Result Cards -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-800">Result Page Integrasi</h2>
        <button @click="loadSavedResultLinks" class="text-xs text-primary hover:underline">Refresh</button>
      </div>

      <div v-if="loadingSavedResultLinks" class="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">
        Memuat data hasil tersimpan...
      </div>

      <div v-else-if="savedResultGroups.length === 0" class="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-400 italic">
        Belum ada hasil tersimpan.
      </div>

      <div v-else class="space-y-3">
        <div v-for="group in savedResultGroups" :key="group.key"
          class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p class="text-[11px] uppercase tracking-wide text-gray-400">Pelajaran</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ group.lessonName }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p class="text-[11px] uppercase tracking-wide text-gray-400">Kelas</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ group.kelasName }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p class="text-[11px] uppercase tracking-wide text-gray-400">Guru</p>
              <p class="font-semibold text-gray-800 mt-0.5">{{ group.teacherName }}</p>
            </div>
          </div>

          <div class="rounded-lg bg-gray-50 border border-gray-100 p-3">
            <p class="text-[11px] uppercase tracking-wide text-gray-400 mb-2">Semua Santri Kelas ({{ group.students.length }})</p>
            <div v-if="group.students.length" class="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              <div v-for="(s, idx) in group.students" :key="s.id || idx"
                class="flex items-center justify-between gap-2 text-sm rounded-md border border-gray-100 bg-white px-2.5 py-1.5">
                <span class="font-medium text-gray-700 truncate">{{ studentLabel(s) }}</span>
                <span class="text-[11px] text-gray-400">#{{ idx + 1 }}</span>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Belum ada data santri untuk kelas ini.</p>
          </div>

          <details class="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <summary class="text-xs font-semibold text-gray-600 cursor-pointer">Riwayat Scan ({{ group.results.length }})</summary>
            <div class="mt-2 space-y-1.5">
              <div v-for="item in group.results.slice(0, 8)" :key="item.id"
                class="flex items-center justify-between rounded-md border border-gray-100 bg-white px-2.5 py-1.5 text-sm">
                <span class="truncate text-gray-700">{{ item.filename || `${item.source || 'scan'} #${item.id}` }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-800">{{ item.score ?? '–' }}</span>
                  <button
                    type="button"
                    @click="deleteSavedResultLink(item)"
                    :disabled="deletingResultLinkId === item.id"
                    class="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    title="Hapus riwayat scan"
                  >
                    <SvgIcon name="trash" :size="13" />
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Answer Key Modal -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showAnswerKeyModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          @click.self="showAnswerKeyModal = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 class="text-base font-bold text-gray-900">Kelola Kunci Jawaban</h3>
              <button @click="showAnswerKeyModal = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <SvgIcon name="close" :size="14" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="overflow-y-auto flex-1 p-5 space-y-5">
              <!-- Add New Key Form -->
              <div class="bg-gray-50 rounded-xl p-4 space-y-3">
                <p class="text-sm font-semibold text-gray-700">Tambah Kunci Jawaban Baru</p>
                <input v-model="newKey.name" placeholder="Nama (misal: UTS Kelas 6)"
                  class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                <div class="space-y-2">
                  <p class="text-xs text-gray-500">Jawaban soal 1–{{ questionTotal }} ({{ selectedOptionLabels.join('/') }})</p>
                  <div class="max-h-72 overflow-y-auto space-y-1 pr-1">
                    <div v-for="n in questionTotal" :key="n"
                      class="flex items-center gap-2 rounded-lg bg-white border border-gray-100 px-2.5 py-1.5">
                      <span class="text-xs font-semibold text-gray-400 w-6 shrink-0 text-right">{{ n }}</span>
                      <div class="flex items-center gap-1.5">
                        <button
                          v-for="opt in selectedOptionLabels"
                          :key="opt"
                          type="button"
                          @click="newKey.answers[n-1] = (newKey.answers[n-1] === opt ? '' : opt)"
                          :class="[
                            'w-8 h-8 rounded-full text-xs font-bold border transition-colors',
                            newKey.answers[n-1] === opt
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                          ]">
                          {{ opt }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button @click="saveNewAnswerKey" :disabled="savingKey"
                  class="w-full btn-primary py-2.5 text-sm font-semibold rounded-xl disabled:opacity-60">
                  {{ savingKey ? 'Menyimpan...' : 'Simpan Kunci Jawaban' }}
                </button>
              </div>

              <!-- Existing Keys -->
              <div v-if="answerKeys.length > 0" class="space-y-2">
                <p class="text-sm font-semibold text-gray-700">Kunci Tersimpan</p>
                <div v-for="ak in answerKeys" :key="ak.id"
                  class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800">{{ ak.name || `Kunci #${ak.id}` }}</p>
                    <p class="text-xs text-gray-400 mt-0.5 truncate">{{ formatAnswerPreview(ak.answers) }}</p>
                  </div>
                  <button @click="deleteAnswerKey(ak.id)"
                    class="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                    <SvgIcon name="close" :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <teleport to="body">
      <transition name="fade">
        <div v-if="showResultPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeResultPreview">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p class="text-sm font-semibold text-gray-800">Preview Hasil Scan</p>
              <div class="flex items-center gap-2">
                <button @click="zoomOutResultPreview" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">-</button>
                <span class="min-w-[3rem] text-center text-xs text-gray-500">{{ Math.round(resultPreviewZoom * 100) }}%</span>
                <button @click="zoomInResultPreview" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">+</button>
                <button @click="closeResultPreview" class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">Tutup</button>
              </div>
            </div>
            <div
              ref="resultPreviewViewportRef"
              class="max-h-[85vh] overflow-auto bg-gray-950 p-4"
              :class="resultPreviewPan.active ? 'cursor-grabbing' : 'cursor-grab'"
              @wheel.prevent="onResultPreviewWheel"
              @pointerdown="onResultPreviewPointerDown"
              @pointermove="onResultPreviewPointerMove"
              @pointerup="onResultPreviewPointerUp"
              @pointercancel="onResultPreviewPointerUp"
              @pointerleave="onResultPreviewPointerUp"
            >
              <img
                v-if="resultPreviewSrc"
                :src="resultPreviewSrc"
                alt="Preview hasil scan"
                class="mx-auto max-w-full origin-top object-contain"
                :style="{ transform: `scale(${resultPreviewZoom})`, transformOrigin: 'top center' }"
              />
            </div>
          </div>
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SvgIcon from '@/components/ui/SvgIcon.vue'
import api from '@/api'
import {
  ocrHealth, ocrScan, ocrScanBulk, ocrScanHardware,
  ocrScannerDevices, ocrGetAnswerKeys, ocrSaveAnswerKey, ocrDeleteAnswerKey, ocrGetCalibration,
  ocrGetResultLinks, ocrCreateResultLink, ocrDeleteResultLink, ocrUpdateResultLinkStudent,
  ocrTemplateRegister, ocrTemplateCurrent, ocrTemplateDelete,
} from '@/api/ocr.js'

// ─── State ────────────────────────────────────────────────────────────────────

const serviceOffline = ref(false)
const activeScanMode = ref('camera')
const scanModes = [
  { key: 'camera', label: 'Kamera', icon: 'photo' },
  { key: 'upload', label: 'Upload', icon: 'download' },
  { key: 'scanner', label: 'Scanner', icon: 'document' },
]
const QUESTION_LAYOUTS = [30, 35, 50]
const selectedQuestionTotal = ref(50)
const questionTotal = computed(() => selectedQuestionTotal.value)
const selectedOptionChoices = ref('ABCDE')
const router = useRouter()
const authStore = useAuthStore()

function normalizeOptionChoices(value) {
  return String(value || '').toUpperCase() === 'ABCD' ? 'ABCD' : 'ABCDE'
}

function getOptionLabels(optionChoices) {
  return normalizeOptionChoices(optionChoices).split('')
}

function buildDefaultScanCalibration(total) {
  const normalizedTotal = Number(total) === 30 || Number(total) === 35 || Number(total) === 50 ? Number(total) : 35

  const base = {
    markedThreshold: 45,
    confidenceGap: 2.5,
    questionColW: 0.1,
    centerPadX: 0.15,
    centerPadY: 0.2,
  }

  if (normalizedTotal === 30) {
    return {
      ...base,
      blocks: [
        { startQ: 1, count: 10, x: 0.12, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
        { startQ: 11, count: 10, x: 0.43, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
        { startQ: 21, count: 10, x: 0.73, y: 0.37, w: 0.23, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
      ],
    }
  }

  if (normalizedTotal === 35) {
    return {
      ...base,
      blocks: [
        { startQ: 1, count: 10, x: 0.12, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
        { startQ: 11, count: 10, x: 0.43, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
        { startQ: 21, count: 10, x: 0.73, y: 0.37, w: 0.23, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
        { startQ: 31, count: 5, x: 0.12, y: 0.64, w: 0.27, h: 0.18, questionColW: 0.1, rowTop: 0, rowBottom: 0.5 },
      ],
    }
  }

  return {
    ...base,
    blocks: [
      { startQ: 1, count: 10, x: 0.12, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
      { startQ: 11, count: 10, x: 0.43, y: 0.37, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
      { startQ: 21, count: 10, x: 0.73, y: 0.37, w: 0.23, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
      { startQ: 31, count: 10, x: 0.12, y: 0.64, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
      { startQ: 41, count: 10, x: 0.43, y: 0.64, w: 0.27, h: 0.32, questionColW: 0.1, rowTop: 0, rowBottom: 1 },
    ],
  }
}

// Camera / file
const cameraInput = ref(null)
const uploadInput = ref(null)
const liveCameraVideoRef = ref(null)
const liveCameraStream = ref(null)
const liveCameraActive = ref(false)
const liveCameraLoading = ref(false)
const liveCameraError = ref('')
const liveDetectEnabled = ref(true)
const liveAutoAlignEnabled = ref(true)
const liveDetectBusy = ref(false)
const liveDetectError = ref('')
const liveDetectSnapshot = ref(null)
const liveAutoFrameRect = ref(null)
const liveAutoFrameConfidence = ref(0)
const liveAutoFrameMissCount = ref(0)
const liveAutoCalibration = ref(null)
const liveLightingQuality = ref(null)
let liveDetectTimer = null
const previewSrc = ref(null)
const previewFile = ref(null)
const uploadFiles = ref([])
const previewDraft = ref(null)
const uploadFileDrafts = ref([])
const OCR_UPLOAD_DRAFT_LIMIT = 8
const dragOver = ref(false)
const lastResultPreview = ref(null)

// Scanning
const scanning = ref(false)
const scanProgress = ref(0)
const scanError = ref(null)
const lastResult = ref(null)
const bulkResults = ref([])
const savedResultLinks = ref([])
const loadingSavedResultLinks = ref(false)
const deletingResultLinkId = ref(null)
const saveFailures = ref([])
const retryingSaves = ref(false)
const saveSuccessMessage = ref('')
const mappingSuccessMessage = ref('')
const showResultPreviewModal = ref(false)
const resultPreviewSrc = ref(null)
const resultPreviewZoom = ref(1)
const resultPreviewViewportRef = ref(null)
const resultPreviewPan = reactive({
  active: false,
  startX: 0,
  startY: 0,
  startScrollLeft: 0,
  startScrollTop: 0,
})
const scanRotation = ref(0)
const scanCalibration = reactive(cloneCalibration(buildDefaultScanCalibration(questionTotal.value)))
const selectedCalibrationBlockIndex = ref(0)
const calibrationStep = ref(0.01)
const calibrationZoom = ref(1.25)
const calibrationTouchMode = ref('resize')
const calibrationStageRef = ref(null)
const calibrationDimensionTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  text: '',
})
const calibrationAspectLocked = ref(false)
const calibrationPinchStartDistance = ref(0)
const calibrationZoomAtPinchStart = ref(1)
const calibrationSlidersEnabled = ref(false)
const calibrationLongPressTimer = ref(null)
const calibrationContextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  blockIndex: -1,
})
const calibrationIsLandscape = ref(false)

// Template registration state
const templateRegistered = ref(null) // null | { name, total, optionChoices, registeredAt }
const templateLoading = ref(false)
const templateError = ref('')
const calibrationDrag = reactive({
  active: false,
  index: -1,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
})

const calibrationResize = reactive({
  active: false,
  index: -1,
  handle: null, // 'nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  originW: 0,
  originH: 0,
})

const calibrationGuideDrag = reactive({
  active: false,
  index: -1,
  axis: null, // 'row' | 'col' | 'split'
  bandIndex: -1,
  startX: 0,
  startY: 0,
  startValue: 0,
})

// Scanner hardware
const scannerDevices = ref([])
const selectedScannerId = ref(null)
const loadingDevices = ref(false)

// Answer keys
const answerKeys = ref([])
const selectedAnswerKeyId = ref(null)
const showAnswerKeyModal = ref(false)
const savingKey = ref(false)
const newKey = reactive({
  name: '',
  answers: Array(questionTotal.value).fill(''),
})
const answerInputRefs = ref([])

// Academic integration
const lessonType = ref('formal')
const lessons = ref([])
const classes = ref([])
const teachers = ref([])
const selectedLessonId = ref(null)
const selectedClassId = ref(null)
const selectedTeacherId = ref(null)
const selectedClassStudents = ref([])
const selectedStudentByResult = reactive({})
const mappingLoadingByResult = reactive({})
const mappingErrorByResult = reactive({})
const OCR_SCAN_BUFFER_KEY = 'ocr-scan-buffer-v1'

const selectedLessonObj = computed(() => lessons.value.find(l => Number(l.id) === Number(selectedLessonId.value)) || null)
const selectedClassObj = computed(() => classes.value.find(k => Number(k.id) === Number(selectedClassId.value)) || null)
const selectedTeacherObj = computed(() => teachers.value.find(t => Number(t.id) === Number(selectedTeacherId.value)) || null)
const selectedOptionLabels = computed(() => getOptionLabels(selectedOptionChoices.value))
const activeOptionLabels = computed(() => getOptionLabels(lastResult.value?.optionChoices || selectedOptionChoices.value))
const liveDetectStatusText = computed(() => {
  if (!liveCameraActive.value) return 'Live detect belum aktif.'
  if (!liveDetectEnabled.value) return 'Live detect dimatikan.'
  if (liveDetectBusy.value) return 'Mendeteksi jawaban dari frame kamera...'
  if (!liveDetectSnapshot.value) return 'Menunggu frame untuk deteksi...'

  const snap = liveDetectSnapshot.value
  const updatedLabel = snap.updatedAt
    ? new Date(snap.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'
  const alignLabel = liveAutoAlignEnabled.value
    ? ` • auto-align ${Math.round(liveAutoFrameConfidence.value * 100)}%`
    : ''
  const qualityLabel = liveLightingQuality.value
    ? ` • light ${liveLightingQuality.value.quality}`
    : ''
  const sectionLabel = snap.section ? ` • ${formatLJKSection(snap.section)}` : ''
  return `Terdeteksi ${snap.detectedCount}/${snap.totalQuestions} jawaban (blank ${snap.blankCount}) • update ${updatedLabel}${sectionLabel}${alignLabel}${qualityLabel}`
})
const liveDetectPreview = computed(() => liveDetectSnapshot.value?.previewText || '')
const liveDetectQuestionMarks = computed(() => Array.isArray(liveDetectSnapshot.value?.answerMarks) ? liveDetectSnapshot.value.answerMarks : [])
const liveFrameGuideStyle = computed(() => {
  const fallback = { x: 0.09, y: 0.15, w: 0.82, h: 0.7 }
  const rect = liveAutoAlignEnabled.value && liveAutoFrameRect.value ? liveAutoFrameRect.value : fallback
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
  }
})
const liveOverlayBlocks = computed(() => {
  const rect = liveAutoAlignEnabled.value ? liveAutoFrameRect.value : null
  const activeCalibration = liveAutoAlignEnabled.value && liveAutoCalibration.value
    ? liveAutoCalibration.value
    : projectCalibrationToFrame(scanCalibration, rect)
  const marksByQn = new Map(liveDetectQuestionMarks.value.map((mark) => [Number(mark.qn), mark]))
  return (Array.isArray(activeCalibration.blocks) ? activeCalibration.blocks : []).map((block, idx) => {
    const startQ = Number(block?.startQ || 1)
    const count = Number(block?.count || 0)
    const rows = Array.from({ length: count }, (_, rowIndex) => {
      const qn = startQ + rowIndex
      const mark = marksByQn.get(qn) || null
      return {
        qn,
        detected: mark?.detected || '-',
        state: mark?.state || 'pending',
      }
    })

    return {
      idx,
      startQ,
      count,
      style: {
        left: `${Number(block?.x || 0) * 100}%`,
        top: `${Number(block?.y || 0) * 100}%`,
        width: `${Number(block?.w || 0) * 100}%`,
        height: `${Number(block?.h || 0) * 100}%`,
      },
      rows,
    }
  })
})
const selectedCalibrationBlock = computed(() => scanCalibration.blocks?.[selectedCalibrationBlockIndex.value] || null)
const calibrationImageSrc = computed(() => previewSrc.value || lastResult?.value?.debug?.sourceImage || lastResultPreview.value || lastResult?.value?.previewUrl || null)
const calibrationStageStyle = computed(() => ({ width: `${Math.max(1, Number(calibrationZoom.value) || 1) * 100}%`, minWidth: '100%' }))
const calibrationGlobalCols = 12
const calibrationGlobalRows = 12
const calibrationBlockCols = computed(() => selectedOptionLabels.value.length)

function buildUniformBands(segmentCount) {
  const safeCount = Math.max(1, Number(segmentCount) || 1)
  return Array.from({ length: safeCount + 1 }, (_, idx) => Number((idx / safeCount).toFixed(4)))
}

function sanitizeGuideBands(inputBands, segmentCount, minGap = 0.02) {
  const safeCount = Math.max(1, Number(segmentCount) || 1)
  const fallback = buildUniformBands(safeCount)

  if (!Array.isArray(inputBands) || inputBands.length !== safeCount + 1) {
    return fallback
  }

  const parsed = inputBands.map((value) => Number(value))
  if (parsed.some((value) => !Number.isFinite(value))) {
    return fallback
  }

  const out = new Array(safeCount + 1)
  out[0] = 0
  out[safeCount] = 1

  for (let idx = 1; idx < safeCount; idx += 1) {
    const min = out[idx - 1] + minGap
    const max = 1 - (safeCount - idx) * minGap
    out[idx] = Math.min(max, Math.max(min, parsed[idx]))
  }

  return out.map((value) => Number(value.toFixed(4)))
}

function getBlockOptionBands(block) {
  return sanitizeGuideBands(block?.optionBands, calibrationBlockCols.value, 0.04)
}

function getBlockRowBands(block) {
  return sanitizeGuideBands(block?.rowBands, Number(block?.count || 1), 0.02)
}

function getDisplayColRatio(block, localRatio) {
  const split = getBlockSplitRatio(block)
  const optionSpan = Math.max(0.05, 1 - split)
  return Number((split + optionSpan * localRatio).toFixed(4))
}

function getColGuideRatios(block) {
  const bands = getBlockOptionBands(block)
  return bands.slice(1, -1).map((ratio, idx) => ({
    ratio: getDisplayColRatio(block, ratio),
    localRatio: ratio,
    bandIndex: idx + 1,
  }))
}

function getRowGuideRatios(block) {
  const bands = getBlockRowBands(block)
  return bands.slice(1, -1).map((ratio, idx) => ({ ratio, bandIndex: idx + 1 }))
}

function getBlockSplitRatio(block) {
  return Number(clamp(Number(block?.questionColW || scanCalibration.questionColW || 0.1), 0.03, 0.45).toFixed(4))
}

function getBlockColLabelCenters(block) {
  const bands = getBlockOptionBands(block)
  return selectedOptionLabels.value.map((label, colIndex) => {
    const localMid = (Number(bands[colIndex]) + Number(bands[colIndex + 1])) / 2
    return {
      label,
      colIndex,
      ratio: getDisplayColRatio(block, localMid),
    }
  })
}

function getBlockRowLabelCenters(block) {
  const rowBands = getBlockRowBands(block)
  const startQ = Number(block?.startQ || 1)
  return Array.from({ length: Number(block?.count || 0) }, (_, rowIndex) => {
    const ratio = (Number(rowBands[rowIndex]) + Number(rowBands[rowIndex + 1])) / 2
    return {
      rowIndex,
      ratio: Number(ratio.toFixed(4)),
      qn: startQ + rowIndex,
    }
  })
}

function ensureBlockGuideBands(block) {
  if (!block || typeof block !== 'object') return
  block.optionBands = getBlockOptionBands(block)
  block.rowBands = getBlockRowBands(block)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  const restored = restoreScanBuffer()

  if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
    calibrationTouchMode.value = 'move'
  }

  try {
    await ocrHealth()
    serviceOffline.value = false
  } catch {
    serviceOffline.value = true
  }
  if (!restored?.hasCalibration) {
    await loadCalibrationDefaults()
  }
  await loadCurrentTemplate()
  await loadAnswerKeys()
  await loadAcademicData()
  await loadSavedResultLinks()
})

onUnmounted(() => {
  stopLiveCamera()
  clearLiveDetectLoop(true)
})

watch(selectedQuestionTotal, async () => {
  newKey.answers = Array(questionTotal.value).fill('')
  answerInputRefs.value = []
  selectedCalibrationBlockIndex.value = 0
  await loadCalibrationDefaults()
})

watch(selectedOptionChoices, async (value) => {
  selectedOptionChoices.value = normalizeOptionChoices(value)
  answerInputRefs.value = []
  newKey.answers = newKey.answers.map((answer) => sanitizeAnswerChoice(answer))
  await loadCalibrationDefaults()
})

watch(activeScanMode, (mode) => {
  if (mode !== 'camera') {
    stopLiveCamera()
    clearLiveDetectLoop(true)
  }
})

watch(previewSrc, (value) => {
  if (value) stopLiveCamera()
})

watch(liveDetectEnabled, (enabled) => {
  if (!enabled) {
    clearLiveDetectLoop(false)
    return
  }
  if (liveCameraActive.value && !previewSrc.value) {
    scheduleLiveDetect(250)
  }
})

watch(
  [
    activeScanMode,
    selectedQuestionTotal,
    selectedOptionChoices,
    scanRotation,
    selectedAnswerKeyId,
    lessonType,
    selectedLessonId,
    selectedClassId,
    selectedTeacherId,
    lastResult,
    bulkResults,
    saveFailures,
    scanCalibration,
    previewDraft,
    uploadFileDrafts,
  ],
  () => {
    persistScanBuffer()
  },
  { deep: true }
)

// ─── File Handling ────────────────────────────────────────────────────────────

function triggerCamera() {
  cameraInput.value?.click()
}

function clearLiveDetectLoop(clearSnapshot = false) {
  if (liveDetectTimer) {
    clearTimeout(liveDetectTimer)
    liveDetectTimer = null
  }
  liveDetectBusy.value = false
  liveDetectError.value = ''
  if (clearSnapshot) {
    liveDetectSnapshot.value = null
    liveAutoFrameRect.value = null
    liveAutoFrameConfidence.value = 0
    liveAutoCalibration.value = null
    liveLightingQuality.value = null
  }
}

function clampUnit(value, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(1, n))
}

function normalizeFrameRect(rect) {
  if (!rect) return null
  const x = clampUnit(rect.x)
  const y = clampUnit(rect.y)
  const w = clampUnit(rect.w)
  const h = clampUnit(rect.h)
  if (w < 0.2 || h < 0.2) return null
  if (x + w > 1 || y + h > 1) return null
  return { x, y, w, h }
}

function analyzeFrameLighting(imageData, width, height) {
  if (!imageData?.data || !width || !height) return null

  let sum = 0
  let sumSq = 0
  let dark = 0
  let bright = 0
  const total = width * height
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
    sum += lum
    sumSq += lum * lum
    if (lum < 70) dark += 1
    if (lum > 200) bright += 1
  }

  const mean = sum / Math.max(1, total)
  const variance = Math.max(0, sumSq / Math.max(1, total) - mean * mean)
  const stdDev = Math.sqrt(variance)
  const darkRatio = dark / Math.max(1, total)
  const brightRatio = bright / Math.max(1, total)

  let quality = 'good'
  if (mean < 110 || darkRatio > 0.42 || stdDev < 34) {
    quality = 'low'
  } else if (mean < 130 || darkRatio > 0.3 || stdDev < 42) {
    quality = 'medium'
  }

  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    darkRatio: Number(darkRatio.toFixed(4)),
    brightRatio: Number(brightRatio.toFixed(4)),
    quality,
  }
}

function longestSegmentAroundCenter(values, threshold, maxGap = 2) {
  if (!Array.isArray(values) || values.length === 0) return null
  const center = Math.floor(values.length / 2)

  const findNearestPass = () => {
    if (values[center] >= threshold) return center
    for (let step = 1; step < values.length; step += 1) {
      const left = center - step
      const right = center + step
      if (left >= 0 && values[left] >= threshold) return left
      if (right < values.length && values[right] >= threshold) return right
    }
    return -1
  }

  const seed = findNearestPass()
  if (seed < 0) return null

  let start = seed
  let end = seed

  let gap = 0
  for (let i = seed - 1; i >= 0; i -= 1) {
    if (values[i] >= threshold) {
      start = i
      gap = 0
      continue
    }
    gap += 1
    if (gap > maxGap) break
  }

  gap = 0
  for (let i = seed + 1; i < values.length; i += 1) {
    if (values[i] >= threshold) {
      end = i
      gap = 0
      continue
    }
    gap += 1
    if (gap > maxGap) break
  }

  return { start, end }
}

function buildLightingFilter(metrics) {
  if (!metrics) return ''
  if (metrics.quality === 'good') return ''

  let brightness = 1.12
  let contrast = 1.18
  let saturate = 0.9

  if (metrics.quality === 'low') {
    brightness = metrics.mean < 95 ? 1.28 : 1.2
    contrast = metrics.stdDev < 28 ? 1.36 : 1.26
    saturate = 0.84
  }

  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
}

function smooth1D(values, radius = 2) {
  if (!Array.isArray(values) || values.length === 0) return []
  const out = new Array(values.length)
  for (let i = 0; i < values.length; i += 1) {
    let sum = 0
    let count = 0
    for (let k = -radius; k <= radius; k += 1) {
      const idx = i + k
      if (idx < 0 || idx >= values.length) continue
      sum += values[idx]
      count += 1
    }
    out[i] = count > 0 ? sum / count : values[i]
  }
  return out
}

function detectCentersFromProfile(profile, segmentCount) {
  const safeCount = Math.max(1, Number(segmentCount) || 1)
  if (!Array.isArray(profile) || profile.length < safeCount * 2) {
    return Array.from({ length: safeCount }, (_, i) => (i + 0.5) * (profile.length / safeCount))
  }

  const centers = []
  const size = profile.length
  const window = Math.max(2, Math.floor(size / (safeCount * 2.5)))

  for (let i = 0; i < safeCount; i += 1) {
    const expected = (i + 0.5) * (size / safeCount)
    const start = Math.max(0, Math.floor(expected - window))
    const end = Math.min(size - 1, Math.ceil(expected + window))

    let bestIdx = Math.round(expected)
    let bestVal = -Infinity
    for (let p = start; p <= end; p += 1) {
      if (profile[p] > bestVal) {
        bestVal = profile[p]
        bestIdx = p
      }
    }
    centers.push(bestIdx)
  }

  for (let i = 1; i < centers.length; i += 1) {
    if (centers[i] <= centers[i - 1]) {
      centers[i] = centers[i - 1] + 1
    }
  }

  return centers
}

function centersToBands(centers, extent) {
  const size = Math.max(1, Number(extent) || 1)
  if (!Array.isArray(centers) || centers.length === 0) {
    return [0, 1]
  }

  const bands = [0]
  for (let i = 0; i < centers.length - 1; i += 1) {
    bands.push((centers[i] + centers[i + 1]) / 2 / size)
  }
  bands.push(1)
  return bands.map((v, idx) => {
    if (idx === 0) return 0
    if (idx === bands.length - 1) return 1
    return Number(clamp(v, 0.02, 0.98).toFixed(4))
  })
}

function estimateBlockBandsFromProbe(grayData, probeW, probeH, block, optionChoices) {
  const x1 = Math.max(0, Math.floor(Number(block.x || 0) * probeW))
  const y1 = Math.max(0, Math.floor(Number(block.y || 0) * probeH))
  const x2 = Math.min(probeW - 1, Math.ceil((Number(block.x || 0) + Number(block.w || 0)) * probeW))
  const y2 = Math.min(probeH - 1, Math.ceil((Number(block.y || 0) + Number(block.h || 0)) * probeH))
  const bw = Math.max(12, x2 - x1 + 1)
  const bh = Math.max(12, y2 - y1 + 1)

  const split = clamp(Number(block.questionColW || 0.1), 0.05, 0.35)
  const ox1 = Math.min(x2, Math.max(x1, Math.floor(x1 + bw * split)))
  const ow = Math.max(8, x2 - ox1 + 1)

  const rowProfile = new Array(bh).fill(0)
  const colProfile = new Array(ow).fill(0)

  for (let yy = 0; yy < bh; yy += 1) {
    const py = y1 + yy
    for (let xx = 0; xx < ow; xx += 1) {
      const px = ox1 + xx
      const lum = grayData[py * probeW + px]
      const darkness = 255 - lum
      rowProfile[yy] += darkness
      colProfile[xx] += darkness
    }
  }

  const smoothedRows = smooth1D(rowProfile, 2)
  const smoothedCols = smooth1D(colProfile, 2)
  const rowCenters = detectCentersFromProfile(smoothedRows, Number(block.count || 1))
  const colCenters = detectCentersFromProfile(smoothedCols, getOptionLabels(optionChoices).length)
  const rowBands = sanitizeGuideBands(centersToBands(rowCenters, bh), Number(block.count || 1), 0.02)
  const optionBands = sanitizeGuideBands(centersToBands(colCenters, ow), getOptionLabels(optionChoices).length, 0.04)

  return {
    ...block,
    rowBands,
    optionBands,
  }
}

function buildAdaptiveCalibrationFromProbe(baseCalibration, frameRect, imageData, probeW, probeH, optionChoices) {
  const projected = projectCalibrationToFrame(baseCalibration, frameRect)
  if (!imageData?.data || !projected?.blocks?.length) return projected

  const grayData = new Uint8Array(probeW * probeH)
  for (let i = 0, p = 0; i < imageData.data.length; i += 4, p += 1) {
    grayData[p] = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3)
  }

  const calibrated = cloneCalibration(projected)
  calibrated.blocks = calibrated.blocks.map((block) => estimateBlockBandsFromProbe(grayData, probeW, probeH, block, optionChoices))
  return calibrated
}

function detectAnswerSheetRect(imageData, width, height) {
  if (!imageData?.data || !width || !height) return null

  const data = imageData.data
  let sumLum = 0
  let sumLumSq = 0
  const totalPixels = width * height

  for (let idx = 0; idx < data.length; idx += 4) {
    const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
    sumLum += lum
    sumLumSq += lum * lum
  }

  const mean = sumLum / Math.max(1, totalPixels)
  const variance = Math.max(0, sumLumSq / Math.max(1, totalPixels) - mean * mean)
  const stdDev = Math.sqrt(variance)
  const lumThreshold = Math.max(132, Math.min(214, mean + stdDev * 0.35))
  const chromaThreshold = Math.max(34, Math.min(66, 40 + stdDev * 0.2))

  const colWhite = Array(width).fill(0)
  const rowWhite = Array(height).fill(0)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const lum = (r + g + b) / 3
      const maxRgb = Math.max(r, g, b)
      const minRgb = Math.min(r, g, b)
      const chroma = maxRgb - minRgb

      // Treat pixels as paper candidate when bright enough and not too colorful.
      if (lum >= lumThreshold && chroma <= chromaThreshold) {
        colWhite[x] += 1
        rowWhite[y] += 1
      }
    }
  }

  const colRatio = colWhite.map((v) => v / Math.max(1, height))
  const rowRatio = rowWhite.map((v) => v / Math.max(1, width))

  const colSegment = longestSegmentAroundCenter(colRatio, 0.42, 3)
  const rowSegment = longestSegmentAroundCenter(rowRatio, 0.4, 3)
  if (!colSegment || !rowSegment) {
    return trackAnswerSheetRectFromPrevious(colRatio, rowRatio, liveAutoFrameRect.value)
  }

  const nx = colSegment.start / width
  const ny = rowSegment.start / height
  const nw = (colSegment.end - colSegment.start + 1) / width
  const nh = (rowSegment.end - rowSegment.start + 1) / height
  const ratio = nw / Math.max(0.001, nh)

  // Common camera view for portrait paper should stay in this range.
  if (nw < 0.4 || nh < 0.42 || nw > 0.94 || nh > 0.96) return null
  if (ratio < 0.45 || ratio > 0.95) return null

  const padX = 0.012
  const padY = 0.012
  return normalizeFrameRect({
    x: Math.max(0, nx - padX),
    y: Math.max(0, ny - padY),
    w: Math.min(1, nw + padX * 2),
    h: Math.min(1, nh + padY * 2),
  })
}

function updateLiveAutoFrameRect(nextRect) {
  if (!nextRect) {
    liveAutoFrameMissCount.value += 1
    liveAutoFrameConfidence.value = Math.max(0, liveAutoFrameConfidence.value - 0.04)
    if (liveAutoFrameMissCount.value >= 14 && liveAutoFrameConfidence.value < 0.08) {
      liveAutoFrameRect.value = null
      liveAutoCalibration.value = null
    }
    return
  }

  const normalized = normalizeFrameRect(nextRect)
  if (!normalized) return

  liveAutoFrameMissCount.value = 0

  const prev = liveAutoFrameRect.value
  if (!prev) {
    liveAutoFrameRect.value = normalized
    liveAutoFrameConfidence.value = 0.58
    return
  }

  const alpha = 0.62
  liveAutoFrameRect.value = {
    x: Number((prev.x + (normalized.x - prev.x) * alpha).toFixed(4)),
    y: Number((prev.y + (normalized.y - prev.y) * alpha).toFixed(4)),
    w: Number((prev.w + (normalized.w - prev.w) * alpha).toFixed(4)),
    h: Number((prev.h + (normalized.h - prev.h) * alpha).toFixed(4)),
  }
  liveAutoFrameConfidence.value = Math.min(1, liveAutoFrameConfidence.value + 0.1)
}

function framePaperScore(colRatio, rowRatio, rect) {
  if (!rect) return -1

  const x1 = Math.max(0, Math.floor(rect.x * colRatio.length))
  const x2 = Math.min(colRatio.length - 1, Math.ceil((rect.x + rect.w) * colRatio.length) - 1)
  const y1 = Math.max(0, Math.floor(rect.y * rowRatio.length))
  const y2 = Math.min(rowRatio.length - 1, Math.ceil((rect.y + rect.h) * rowRatio.length) - 1)
  if (x2 <= x1 || y2 <= y1) return -1

  let colSum = 0
  for (let x = x1; x <= x2; x += 1) colSum += Number(colRatio[x] || 0)
  let rowSum = 0
  for (let y = y1; y <= y2; y += 1) rowSum += Number(rowRatio[y] || 0)

  const colAvg = colSum / Math.max(1, x2 - x1 + 1)
  const rowAvg = rowSum / Math.max(1, y2 - y1 + 1)
  return (colAvg + rowAvg) / 2
}

function trackAnswerSheetRectFromPrevious(colRatio, rowRatio, prevRect) {
  if (!prevRect) return null

  let best = null
  let bestScore = -1

  const dxs = [-0.02, -0.01, 0, 0.01, 0.02]
  const dys = [-0.02, -0.01, 0, 0.01, 0.02]
  const dss = [-0.02, 0, 0.02]

  for (const dx of dxs) {
    for (const dy of dys) {
      for (const ds of dss) {
        const candidate = normalizeFrameRect({
          x: prevRect.x + dx,
          y: prevRect.y + dy,
          w: prevRect.w * (1 + ds),
          h: prevRect.h * (1 + ds),
        })
        if (!candidate) continue
        const score = framePaperScore(colRatio, rowRatio, candidate)
        if (score > bestScore) {
          bestScore = score
          best = candidate
        }
      }
    }
  }

  return bestScore >= 0.42 ? best : null
}

function projectCalibrationToFrame(calibration, frameRect) {
  const base = cloneCalibration(calibration)
  const rect = normalizeFrameRect(frameRect)
  if (!rect) return base

  base.blocks = (Array.isArray(base.blocks) ? base.blocks : []).map((block) => ({
    ...block,
    x: Number((rect.x + Number(block.x || 0) * rect.w).toFixed(4)),
    y: Number((rect.y + Number(block.y || 0) * rect.h).toFixed(4)),
    w: Number((Number(block.w || 0) * rect.w).toFixed(4)),
    h: Number((Number(block.h || 0) * rect.h).toFixed(4)),
  }))

  return base
}

async function captureLiveFrameData() {
  const video = liveCameraVideoRef.value
  if (!video || !video.videoWidth || !video.videoHeight) return null

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  let lightingMetrics = null
  let adaptiveCalibration = null
  if (liveAutoAlignEnabled.value) {
    const probeW = 420
    const probeH = Math.max(240, Math.round((canvas.height / canvas.width) * probeW))
    const probe = document.createElement('canvas')
    probe.width = probeW
    probe.height = probeH
    const probeCtx = probe.getContext('2d', { willReadFrequently: true })
    if (probeCtx) {
      probeCtx.drawImage(canvas, 0, 0, probeW, probeH)
      const imageData = probeCtx.getImageData(0, 0, probeW, probeH)
      lightingMetrics = analyzeFrameLighting(imageData, probeW, probeH)
      liveLightingQuality.value = lightingMetrics
      const rect = detectAnswerSheetRect(imageData, probeW, probeH)
      updateLiveAutoFrameRect(rect)
      if (liveAutoFrameRect.value) {
        adaptiveCalibration = buildAdaptiveCalibrationFromProbe(
          { ...scanCalibration, optionChoices: normalizeOptionChoices(selectedOptionChoices.value) },
          liveAutoFrameRect.value,
          imageData,
          probeW,
          probeH,
          normalizeOptionChoices(selectedOptionChoices.value),
        )
        liveAutoCalibration.value = adaptiveCalibration
      }
    }
  }

  const filter = buildLightingFilter(liveLightingQuality.value)
  if (filter) {
    const enhancedCanvas = document.createElement('canvas')
    enhancedCanvas.width = canvas.width
    enhancedCanvas.height = canvas.height
    const enhancedCtx = enhancedCanvas.getContext('2d')
    if (enhancedCtx) {
      enhancedCtx.filter = filter
      enhancedCtx.drawImage(canvas, 0, 0)
      enhancedCtx.filter = 'none'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(enhancedCanvas, 0, 0)
    }
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  if (!blob) return null
  return {
    blob,
    frameRect: liveAutoFrameRect.value,
    adaptiveCalibration,
    lighting: lightingMetrics || liveLightingQuality.value,
  }
}

function collectDetectedAnswers(scanData) {
  if (Array.isArray(scanData?.answers)) {
    return scanData.answers
      .map((item) => String(item?.detected || '').toUpperCase())
      .filter((choice) => choice && choice !== '-')
  }

  if (scanData?.parsedAnswers && typeof scanData.parsedAnswers === 'object') {
    return Object.values(scanData.parsedAnswers)
      .map((value) => String(value || '').toUpperCase())
      .filter((choice) => choice && choice !== '-')
  }

  return []
}

function buildAnswerMarks(scanData) {
  const answers = Array.isArray(scanData?.answers) ? scanData.answers : []
  const total = Math.max(questionTotal.value, answers.length)
  return Array.from({ length: total }, (_, idx) => {
    const item = answers[idx] || {}
    const detected = String(item?.detected || item?.actual || '').toUpperCase()
    const expected = String(item?.expected || '').toUpperCase()
    const correct = typeof item?.correct === 'boolean' ? item.correct : null
    const blank = !detected || detected === '-'
    return {
      qn: idx + 1,
      detected: blank ? '-' : detected,
      expected: expected || null,
      correct,
      blank,
      state: blank ? 'blank' : correct === true ? 'correct' : correct === false ? 'wrong' : 'detected',
    }
  })
}

async function runLiveDetectOnce() {
  if (!liveCameraActive.value || !liveDetectEnabled.value || liveDetectBusy.value || scanning.value) return

  const frame = await captureLiveFrameData()
  if (!frame?.blob) return

  liveDetectBusy.value = true
  liveDetectError.value = ''

  try {
    const fd = new FormData()
    const frameFile = new File([frame.blob], `live-${Date.now()}.jpg`, { type: 'image/jpeg' })
    fd.append('file', frameFile)
    fd.append('total', String(questionTotal.value))
    fd.append('optionChoices', normalizeOptionChoices(selectedOptionChoices.value))
    fd.append('rotation', String(scanRotation.value || 0))
    const liveCalibration = liveAutoAlignEnabled.value && (frame.adaptiveCalibration || liveAutoCalibration.value)
      ? (frame.adaptiveCalibration || liveAutoCalibration.value)
      : projectCalibrationToFrame(
        { ...scanCalibration, optionChoices: normalizeOptionChoices(selectedOptionChoices.value) },
        liveAutoAlignEnabled.value ? frame.frameRect : null,
      )
    fd.append('calibration', JSON.stringify(liveCalibration))
    if (selectedAnswerKeyId.value) fd.append('answerKeyId', selectedAnswerKeyId.value)

    const res = await ocrScan(fd)
    const scanData = addResultContext(res.data)
    const detectedAnswers = collectDetectedAnswers(scanData)
    const answerMarks = buildAnswerMarks(scanData)
    const previewText = detectedAnswers.slice(0, 12).map((value, idx) => `${idx + 1}:${value}`).join(' · ')
    const totalQuestions = Number(questionTotal.value) || detectedAnswers.length

    liveDetectSnapshot.value = {
      detectedCount: detectedAnswers.length,
      blankCount: Math.max(0, totalQuestions - detectedAnswers.length),
      totalQuestions,
      updatedAt: Date.now(),
      previewText,
      answerMarks,
      section: scanData?.sectionInfo?.section || null,
      autoAligned: !!(liveAutoAlignEnabled.value && liveAutoFrameRect.value),
      alignConfidence: Math.round(liveAutoFrameConfidence.value * 100),
      lighting: frame.lighting || null,
    }
  } catch (err) {
    liveDetectError.value = err?.response?.data?.message || err?.message || 'Live detect gagal pada frame ini'
  } finally {
    liveDetectBusy.value = false
  }
}

function scheduleLiveDetect(delayMs = 550) {
  if (!liveCameraActive.value || !liveDetectEnabled.value) return

  clearTimeout(liveDetectTimer)
  liveDetectTimer = setTimeout(async () => {
    await runLiveDetectOnce()
    scheduleLiveDetect(520)
  }, Math.max(250, Number(delayMs) || 550))
}

async function startLiveCamera() {
  if (liveCameraActive.value || liveCameraLoading.value) return
  liveCameraLoading.value = true
  liveCameraError.value = ''
  liveDetectError.value = ''

  try {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Browser tidak mendukung live camera')
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })

    liveCameraStream.value = stream
    liveCameraActive.value = true

    await nextTick()
    const video = liveCameraVideoRef.value
    if (video) {
      video.srcObject = stream
      await video.play().catch(() => {})
    }

    if (liveDetectEnabled.value) {
      scheduleLiveDetect(350)
    }
  } catch (err) {
    liveCameraError.value = err?.message || 'Gagal membuka kamera live'
    stopLiveCamera()
  } finally {
    liveCameraLoading.value = false
  }
}

function stopLiveCamera() {
  const video = liveCameraVideoRef.value
  if (video) {
    video.pause?.()
    video.srcObject = null
  }

  const stream = liveCameraStream.value
  if (stream?.getTracks) {
    stream.getTracks().forEach((track) => track.stop())
  }

  clearLiveDetectLoop(false)
  liveAutoFrameRect.value = null
  liveAutoFrameConfidence.value = 0
  liveAutoCalibration.value = null
  liveLightingQuality.value = null
  liveCameraStream.value = null
  liveCameraActive.value = false
}

async function captureLiveCameraFrame() {
  const frame = await captureLiveFrameData()
  if (!frame?.blob) {
    liveCameraError.value = 'Kamera belum siap untuk capture'
    return
  }

  const file = new File([frame.blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
  stopLiveCamera()
  loadPreview(file)
}

function triggerUpload() {
  uploadInput.value?.click()
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(String(event?.target?.result || ''))
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

async function buildFileDraft(file) {
  if (!(file instanceof File)) return null
  try {
    const dataUrl = await fileToDataUrl(file)
    if (!dataUrl) return null
    return {
      name: file.name || `upload-${Date.now()}.jpg`,
      type: file.type || 'image/jpeg',
      dataUrl,
    }
  } catch {
    return null
  }
}

function fileFromDraft(draft) {
  if (!draft || typeof draft !== 'object') return null
  const dataUrl = String(draft.dataUrl || '')
  if (!dataUrl.includes(',')) return null

  try {
    const [meta, payload] = dataUrl.split(',', 2)
    const mimeMatch = meta.match(/data:(.*?);base64/)
    const mime = mimeMatch?.[1] || draft.type || 'image/jpeg'
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new File([bytes], String(draft.name || `upload-${Date.now()}.jpg`), { type: mime })
  } catch {
    return null
  }
}

async function setUploadDraftsFromFiles(files) {
  const safeFiles = Array.isArray(files) ? files : []
  const limited = safeFiles.slice(0, OCR_UPLOAD_DRAFT_LIMIT)
  const drafts = await Promise.all(limited.map((file) => buildFileDraft(file)))
  uploadFileDrafts.value = drafts.filter(Boolean)
}

function onFileSelected(e) {
  const file = e.target.files[0]
  if (!file) return
  loadPreview(file)
}

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) loadPreview(file)
}

async function onDropMultiple(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (!files.length) return
  uploadFiles.value = files
  await setUploadDraftsFromFiles(files)
}

async function onMultipleFilesSelected(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
  uploadFiles.value = files
  await setUploadDraftsFromFiles(files)
}

function loadPreview(file) {
  previewFile.value = file
  const reader = new FileReader()
  reader.onload = ev => { previewSrc.value = ev.target.result }
  reader.readAsDataURL(file)
  buildFileDraft(file).then((draft) => {
    previewDraft.value = draft
  }).catch(() => {
    previewDraft.value = null
  })
  lastResult.value = null
  scanError.value = null
}

function clearPreview() {
  previewSrc.value = null
  previewFile.value = null
  previewDraft.value = null
  lastResult.value = null
  if (cameraInput.value) cameraInput.value.value = ''
}

function clearUploadFiles() {
  uploadFiles.value = []
  uploadFileDrafts.value = []
  bulkResults.value = []
  if (uploadInput.value) uploadInput.value.value = ''
}

// ─── Scan Actions ─────────────────────────────────────────────────────────────

async function doScan() {
  if (!previewFile.value || scanning.value) return
  scanning.value = true
  scanError.value = null
  lastResultPreview.value = previewSrc.value

  try {
    const fd = new FormData()
    fd.append('file', previewFile.value)
    fd.append('total', String(questionTotal.value))
    fd.append('optionChoices', normalizeOptionChoices(selectedOptionChoices.value))
    fd.append('rotation', String(scanRotation.value || 0))
    fd.append('calibration', JSON.stringify({ ...scanCalibration, optionChoices: normalizeOptionChoices(selectedOptionChoices.value) }))
    if (selectedAnswerKeyId.value) fd.append('answerKeyId', selectedAnswerKeyId.value)
    if (selectedLessonId.value) fd.append('lessonId', selectedLessonId.value)
    if (selectedClassId.value) fd.append('kelasId', selectedClassId.value)
    if (selectedTeacherId.value) fd.append('teacherId', selectedTeacherId.value)

    const res = await ocrScan(fd)
    lastResult.value = addResultContext(res.data)
    const persisted = await saveResultLink(lastResult.value, 'scan')
    if (persisted.ok && persisted.resultLinkId) {
      lastResult.value.resultLinkId = persisted.resultLinkId
    }
    if (!persisted.ok) {
      enqueueSaveFailure(lastResult.value, 'scan')
    }
    await loadSavedResultLinks()
  } catch (err) {
    scanError.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal memproses gambar'
  } finally {
    scanning.value = false
  }
}

async function doScanBulk() {
  if (!uploadFiles.value.length || scanning.value) return
  scanning.value = true
  scanError.value = null
  bulkResults.value = []
  scanProgress.value = 0

  try {
    const fd = new FormData()
    uploadFiles.value.forEach(f => fd.append('files', f))
    fd.append('total', String(questionTotal.value))
    fd.append('optionChoices', normalizeOptionChoices(selectedOptionChoices.value))
    fd.append('rotation', String(scanRotation.value || 0))
    fd.append('calibration', JSON.stringify({ ...scanCalibration, optionChoices: normalizeOptionChoices(selectedOptionChoices.value) }))
    if (selectedAnswerKeyId.value) fd.append('answerKeyId', selectedAnswerKeyId.value)
    if (selectedLessonId.value) fd.append('lessonId', selectedLessonId.value)
    if (selectedClassId.value) fd.append('kelasId', selectedClassId.value)
    if (selectedTeacherId.value) fd.append('teacherId', selectedTeacherId.value)

    const res = await ocrScanBulk(fd)
    const raw = Array.isArray(res.data?.items)
      ? res.data.items
      : Array.isArray(res.data?.results)
        ? res.data.results
        : []
    bulkResults.value = raw.map(item => addResultContext(item))
    const savable = bulkResults.value.filter(item => !item?.error)
    const persisted = await runWithConcurrency(
      savable,
      (item) => saveResultLink(item, 'scan-bulk'),
      3,
    )
    persisted.forEach((status, idx) => {
      if (status.ok && status.resultLinkId) {
        savable[idx].resultLinkId = status.resultLinkId
      }
      if (!status.ok) {
        enqueueSaveFailure(savable[idx], 'scan-bulk')
      }
    })
    await loadSavedResultLinks()
  } catch (err) {
    scanError.value = err.response?.data?.message || err.message || 'Gagal memproses gambar'
  } finally {
    scanning.value = false
    scanProgress.value = 0
  }
}

async function doHardwareScan() {
  if (!selectedScannerId.value || scanning.value) return
  scanning.value = true
  scanError.value = null
  lastResult.value = null

  try {
    const fd = new FormData()
    fd.append('deviceId', selectedScannerId.value)
    fd.append('total', String(questionTotal.value))
    fd.append('optionChoices', normalizeOptionChoices(selectedOptionChoices.value))
    fd.append('rotation', String(scanRotation.value || 0))
    fd.append('calibration', JSON.stringify({ ...scanCalibration, optionChoices: normalizeOptionChoices(selectedOptionChoices.value) }))
    if (selectedAnswerKeyId.value) fd.append('answerKeyId', selectedAnswerKeyId.value)
    if (selectedLessonId.value) fd.append('lessonId', selectedLessonId.value)
    if (selectedClassId.value) fd.append('kelasId', selectedClassId.value)
    if (selectedTeacherId.value) fd.append('teacherId', selectedTeacherId.value)

    const res = await ocrScanHardware(fd)
    lastResult.value = addResultContext(res.data)
    const persisted = await saveResultLink(lastResult.value, 'scan-hardware')
    if (persisted.ok && persisted.resultLinkId) {
      lastResult.value.resultLinkId = persisted.resultLinkId
    }
    if (!persisted.ok) {
      enqueueSaveFailure(lastResult.value, 'scan-hardware')
    }
    await loadSavedResultLinks()
  } catch (err) {
    scanError.value = err.response?.data?.message || err.message || 'Gagal scan dengan scanner'
  } finally {
    scanning.value = false
  }
}

// ─── Scanner Devices ──────────────────────────────────────────────────────────

async function loadScannerDevices() {
  loadingDevices.value = true
  try {
    const res = await ocrScannerDevices()
    scannerDevices.value = res.data?.devices || []
  } catch {
    scannerDevices.value = []
  } finally {
    loadingDevices.value = false
  }
}

// ─── Answer Keys ──────────────────────────────────────────────────────────────

async function loadAnswerKeys() {
  try {
    const res = await ocrGetAnswerKeys()
    answerKeys.value = res.data?.keys || res.data || []
    if (answerKeys.value.length && !selectedAnswerKeyId.value) {
      selectedAnswerKeyId.value = answerKeys.value[0].id
    }
  } catch {
    answerKeys.value = []
  }
}

async function loadAcademicData() {
  await Promise.all([
    loadLessons(),
    loadClasses(),
    loadTeachers(),
  ])
  await handleLessonOrClassChange()
}

async function loadSavedResultLinks() {
  loadingSavedResultLinks.value = true
  try {
    const params = { per_page: 200 }
    if (selectedClassId.value) params.kelas_id = selectedClassId.value
    if (selectedLessonId.value) params.lesson_id = selectedLessonId.value
    const res = await ocrGetResultLinks(params)
    savedResultLinks.value = Array.isArray(res.data?.data) ? res.data.data : []
  } catch {
    savedResultLinks.value = []
  } finally {
    loadingSavedResultLinks.value = false
  }
}

async function deleteSavedResultLink(item) {
  const id = Number(item?.id)
  if (!Number.isFinite(id) || id <= 0) return
  const ok = window.confirm(`Hapus riwayat scan #${id}?`)
  if (!ok) return

  deletingResultLinkId.value = id
  scanError.value = null
  try {
    await ocrDeleteResultLink(id)
    savedResultLinks.value = savedResultLinks.value.filter((row) => Number(row?.id) !== id)
  } catch (err) {
    scanError.value = err.response?.data?.message || 'Gagal menghapus riwayat scan'
  } finally {
    deletingResultLinkId.value = null
  }
}

function stripResultImages(result) {
  if (!result || typeof result !== 'object') return null

  const compactAnswers = {}
  if (Array.isArray(result.answers)) {
    result.answers.forEach((item, idx) => {
      const detected = String(item?.detected || '').toUpperCase()
      if (detected) compactAnswers[String(idx + 1)] = detected
    })
  } else if (result.parsedAnswers && typeof result.parsedAnswers === 'object') {
    Object.entries(result.parsedAnswers).forEach(([key, value]) => {
      const detected = String(value || '').toUpperCase()
      if (detected) compactAnswers[String(key)] = detected
    })
  }

  const missing = Array.isArray(result.missing)
    ? result.missing.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0 && n <= 1000)
    : []

  // Keep only minimal, serializable fields needed for audit/history.
  return {
    version: 1,
    method: result.method || null,
    sectionInfo: result?.sectionInfo && typeof result.sectionInfo === 'object'
      ? {
        section: result.sectionInfo.section || null,
        visibleBlockCount: toNumberOrNull(result.sectionInfo.visibleBlockCount),
      }
      : null,
    rotation: toNumberOrNull(result.rotation),
    optionChoices: normalizeOptionChoices(result.optionChoices || selectedOptionChoices.value),
    score: {
      score: toNumberOrNull(result.score),
      correct: toNumberOrNull(result.correct),
      wrong: toNumberOrNull(result.wrong),
      blank: toNumberOrNull(result.blank),
    },
    answers: compactAnswers,
    missing,
  }
}

async function saveResultLink(result, source) {
  const ctx = getResultContext(result)
  const idempotencyKey = buildIdempotencyKey(result, source, ctx)
  const scoreValue = toNumberOrNull(result?.score)
  const payload = {
    source,
    idempotency_key: idempotencyKey,
    filename: result?.filename || result?.fileName || null,
    score: scoreValue,
    correct: toPositiveIntOrNull(result?.correct),
    wrong: toPositiveIntOrNull(result?.wrong),
    blank: toPositiveIntOrNull(result?.blank),
    raw_result: stripResultImages(result),
    lesson_type: lessonType.value,
    lesson_id: toPositiveIntOrNull(ctx.lessonId),
    kelas_id: toPositiveIntOrNull(ctx.classId),
    teacher_id: toPositiveIntOrNull(ctx.teacherId),
    answer_key_id: toPositiveIntOrNull(selectedAnswerKeyId.value),
  }

  try {
    const res = await ocrCreateResultLink(payload)
    const resultLinkId = toPositiveIntOrNull(res?.data?.id)
      || toPositiveIntOrNull(res?.data?.data?.id)
      || null
    return { ok: true, resultLinkId }
  } catch (err) {
    const status = err?.response?.status
    const errCode = err?.response?.data?.error
    if (status === 401 || (status === 400 && errCode === 'unauthorized')) {
      // Auth failed even after interceptor refresh attempt — force re-login
      authStore.accessToken = null
      authStore.user = null
      router.push({ name: 'login', query: { redirect: '/ocr', reason: 'session_expired' } })
      return { ok: false, authError: true }
    }
    return { ok: false }
  }
}

function getResultBufferKey(result, bulkIndex = null) {
  if (!result || typeof result !== 'object') return `result-${bulkIndex ?? 'single'}`
  if (result.bufferKey) return result.bufferKey
  const id = toPositiveIntOrNull(result.resultLinkId)
  if (id) {
    result.bufferKey = `result-link-${id}`
    return result.bufferKey
  }

  const fingerprint = hashString(JSON.stringify({
    filename: result.filename || result.fileName || null,
    score: result.score ?? null,
    correct: result.correct ?? null,
    wrong: result.wrong ?? null,
    blank: result.blank ?? null,
    source: result.source || null,
    lessonId: result?.metaContext?.lessonId || null,
    classId: result?.metaContext?.classId || null,
    teacherId: result?.metaContext?.teacherId || null,
    index: bulkIndex,
  }))

  result.bufferKey = `result-${fingerprint}`
  return result.bufferKey
}

function onStudentSelectionChange(key, value) {
  const parsed = Number(value || 0)
  selectedStudentByResult[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : null
  if (mappingErrorByResult[key]) {
    mappingErrorByResult[key] = ''
  }
}

async function assignStudentToResult(result, source = 'scan', bulkIndex = null) {
  const key = getResultBufferKey(result, bulkIndex)
  const studentId = Number(selectedStudentByResult[key] || 0)
  if (!studentId || !result) return

  mappingLoadingByResult[key] = true
  mappingErrorByResult[key] = ''

  try {
    let resultLinkId = toPositiveIntOrNull(result.resultLinkId)
    if (!resultLinkId) {
      const persisted = await saveResultLink(result, source)
      if (!persisted.ok) {
        mappingErrorByResult[key] = 'Gagal menyimpan hasil scan sebelum mapping santri.'
        enqueueSaveFailure(result, source)
        return
      }
      resultLinkId = persisted.resultLinkId
      if (resultLinkId) {
        result.resultLinkId = resultLinkId
      }
    }

    if (!resultLinkId) {
      mappingErrorByResult[key] = 'ID hasil scan tidak ditemukan. Coba refresh lalu simpan lagi.'
      return
    }

    await ocrUpdateResultLinkStudent(resultLinkId, { student_id: studentId })
    mappingSuccessMessage.value = `Santri berhasil dipasangkan ke hasil #${resultLinkId}.`
    await loadSavedResultLinks()
    persistScanBuffer()

    if (mappingSuccessMessage.value) {
      setTimeout(() => {
        mappingSuccessMessage.value = ''
      }, 2500)
    }
  } catch (err) {
    mappingErrorByResult[key] = err?.response?.data?.message || 'Gagal menyimpan mapping santri'
  } finally {
    mappingLoadingByResult[key] = false
  }
}

function enqueueSaveFailure(result, source) {
  saveFailures.value.push({
    result,
    source,
    id: `${source}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  })
}

async function retryFailedSaves() {
  if (!saveFailures.value.length || retryingSaves.value) return

  retryingSaves.value = true
  const queued = [...saveFailures.value]
  saveFailures.value = []

  try {
    const beforeFailed = queued.length
    for (const item of queued) {
      const status = await saveResultLink(item.result, item.source)
      if (!status.ok) {
        saveFailures.value.push(item)
      }
    }

    await loadSavedResultLinks()
    const recovered = beforeFailed - saveFailures.value.length
    if (recovered > 0) {
      saveSuccessMessage.value = `${recovered} data berhasil disinkronkan.`
      setTimeout(() => {
        saveSuccessMessage.value = ''
      }, 2500)
    }
  } finally {
    retryingSaves.value = false
  }
}

async function runWithConcurrency(items, worker, concurrency = 3) {
  const limit = Math.max(1, Number(concurrency) || 1)
  const results = new Array(items.length)
  let nextIndex = 0

  async function consume() {
    while (true) {
      const current = nextIndex
      nextIndex += 1
      if (current >= items.length) return
      results[current] = await worker(items[current], current)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => consume())
  await Promise.all(workers)
  return results
}

function hashString(input) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(16)
}

function buildIdempotencyKey(result, source, ctx) {
  const basis = {
    source,
    filename: result?.filename || result?.fileName || null,
    score: result?.score ?? null,
    correct: result?.correct ?? null,
    wrong: result?.wrong ?? null,
    blank: result?.blank ?? null,
    lessonId: ctx?.lessonId || null,
    classId: ctx?.classId || null,
    teacherId: ctx?.teacherId || null,
    answerKeyId: selectedAnswerKeyId.value || null,
    answers: Array.isArray(result?.answers)
      ? result.answers.map((x) => `${x?.detected || ''}:${x?.correct}`).join('|')
      : null,
  }

  return `ocr-${hashString(JSON.stringify(basis))}`
}

async function loadLessons() {
  try {
    const res = await api.get('/lessons', { params: { type: lessonType.value } })
    lessons.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch {
    lessons.value = []
  }
}

async function loadClasses() {
  try {
    const res = await api.get('/kelas', { params: { per_page: 1000 } })
    classes.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch {
    classes.value = []
  }
}

async function loadTeachers() {
  try {
    const res = await api.get('/users', { params: { role: 'guru', per_page: 1000 } })
    teachers.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch {
    teachers.value = []
  }
}

async function handleLessonTypeChange() {
  selectedLessonId.value = null
  await loadLessons()
  await handleLessonOrClassChange()
}

async function handleLessonOrClassChange() {
  // Auto-pick teacher from lesson assignment when lesson and class are selected.
  const lesson = selectedLessonObj.value
  const classId = Number(selectedClassId.value)
  if (lesson && classId) {
    const assignment = (lesson.assignments || []).find(a => Number(a.kelas?.id) === classId)
    if (assignment?.teacher?.id) {
      selectedTeacherId.value = assignment.teacher.id
    }
  }
  await ensureSelectedClassStudents()
}

async function ensureSelectedClassStudents() {
  selectedClassStudents.value = []
  const cls = selectedClassObj.value
  if (!cls) return

  if (Array.isArray(cls.students) && cls.students.length) {
    selectedClassStudents.value = cls.students
    return
  }

  try {
    const res = await api.get(`/kelas/${cls.id}`)
    const detail = res.data?.data || res.data
    selectedClassStudents.value = Array.isArray(detail?.students) ? detail.students : []
  } catch {
    selectedClassStudents.value = []
  }
}

async function saveNewAnswerKey() {
  if (!newKey.name.trim()) {
    alert('Nama kunci jawaban wajib diisi')
    return
  }
  savingKey.value = true
  try {
    await ocrSaveAnswerKey({
      name: newKey.name,
      answers: newKey.answers.slice(0, questionTotal.value).map((answer) => sanitizeAnswerChoice(answer)).map((answer) => answer || ''),
      total: questionTotal.value,
      optionChoices: normalizeOptionChoices(selectedOptionChoices.value),
    })
    newKey.name = ''
    newKey.answers = Array(questionTotal.value).fill('')
    await loadAnswerKeys()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan kunci jawaban')
  } finally {
    savingKey.value = false
  }
}

async function deleteAnswerKey(id) {
  if (!confirm('Hapus kunci jawaban ini?')) return
  try {
    await ocrDeleteAnswerKey(id)
    if (selectedAnswerKeyId.value === id) selectedAnswerKeyId.value = null
    await loadAnswerKeys()
  } catch {
    alert('Gagal menghapus')
  }
}

function focusNext(n) {
  const next = answerInputRefs.value[n]
  if (next) next.focus()
}

function sanitizeAnswerChoice(value, optionChoices = selectedOptionChoices.value) {
  const normalized = String(value || '').toUpperCase()
  return getOptionLabels(optionChoices).includes(normalized) ? normalized : ''
}

function onAnswerKeyInput(n, event) {
  const sanitized = sanitizeAnswerChoice(event?.target?.value)
  newKey.answers[n - 1] = sanitized
  if (event?.target) {
    event.target.value = sanitized
  }
  if (sanitized && n < questionTotal.value) {
    focusNext(n)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreGrade(score) {
  if (score == null) return '?'
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  return 'D'
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatAnswerPreview(answers) {
  if (!answers || !answers.length) return 'Tidak ada jawaban'
  const arr = Array.isArray(answers) ? answers : Object.values(answers)
  return arr.slice(0, 10).join(' ') + (arr.length > 10 ? ' ...' : '')
}

function formatScanMethod(method) {
  if (!method) return 'Tidak diketahui'
  if (method === 'layout-grid') return 'Layout Grid'
  if (method === 'text-ocr') return 'OCR Teks'
  if (method === 'no-reliable-detection') return 'Deteksi Lemah'
  return String(method)
}

function formatLJKSection(section) {
  if (!section) return 'Tidak diketahui'
  if (section === 'A_pilihan_ganda') return 'A. Pilihan Ganda'
  if (section === 'B_essay') return 'B. Essay/Uraian'
  if (section === 'AB_complete') return 'Lembar Lengkap'
  return String(section)
}

function classLabel(k) {
  if (!k) return '-'
  return `${k.nama || '-'} ${k.tingkat || ''}`.trim()
}

function studentLabel(student) {
  return student?.nama_lengkap || student?.nama || student?.name || `Santri #${student?.id || '?'}`
}

function buildResultContext() {
  return {
    lessonId: selectedLessonId.value,
    lessonName: selectedLessonObj.value?.name || null,
    classId: selectedClassId.value,
    className: selectedClassObj.value ? classLabel(selectedClassObj.value) : null,
    teacherId: selectedTeacherId.value,
    teacherName: selectedTeacherObj.value?.name || null,
    students: [...selectedClassStudents.value],
  }
}

function cloneCalibration(source) {
  return JSON.parse(JSON.stringify(source))
}

function applyCalibration(calibration) {
  const base = cloneCalibration(buildDefaultScanCalibration(questionTotal.value))
  const incoming = calibration && typeof calibration === 'object' ? calibration : {}
  const optionChoices = normalizeOptionChoices(incoming.optionChoices || selectedOptionChoices.value)

  scanCalibration.optionChoices = optionChoices
  scanCalibration.markedThreshold = Number.isFinite(Number(incoming.markedThreshold)) ? Number(incoming.markedThreshold) : base.markedThreshold
  scanCalibration.confidenceGap = Number.isFinite(Number(incoming.confidenceGap)) ? Number(incoming.confidenceGap) : base.confidenceGap
  scanCalibration.questionColW = Number.isFinite(Number(incoming.questionColW)) ? Number(incoming.questionColW) : base.questionColW
  scanCalibration.centerPadX = Number.isFinite(Number(incoming.centerPadX)) ? Number(incoming.centerPadX) : base.centerPadX
  scanCalibration.centerPadY = Number.isFinite(Number(incoming.centerPadY)) ? Number(incoming.centerPadY) : base.centerPadY

  const incomingBlocks = Array.isArray(incoming.blocks) ? incoming.blocks : []
  scanCalibration.blocks = base.blocks.map((block, idx) => {
    const src = incomingBlocks[idx] || {}
    const safeCount = Number.isFinite(Number(src.count)) ? Number(src.count) : Number(block.count || 1)
    return {
      ...block,
      ...src,
      count: safeCount,
      optionBands: sanitizeGuideBands(src.optionBands ?? block.optionBands, calibrationBlockCols.value, 0.04),
      rowBands: sanitizeGuideBands(src.rowBands ?? block.rowBands, safeCount, 0.02),
    }
  })
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function zoomInCalibration() {
  calibrationZoom.value = Number(clamp((Number(calibrationZoom.value) || 1) + 0.25, 1, 5).toFixed(2))
}

function zoomOutCalibration() {
  calibrationZoom.value = Number(clamp((Number(calibrationZoom.value) || 1) - 0.25, 1, 5).toFixed(2))
}

function setCalibrationZoom(value) {
  calibrationZoom.value = Number(clamp(Number(value) || 1, 1, 5).toFixed(2))
}

function openResultPreview(src) {
  if (!src) return
  resultPreviewSrc.value = src
  resultPreviewZoom.value = 1
  resultPreviewPan.active = false
  showResultPreviewModal.value = true
  requestAnimationFrame(() => {
    const viewport = resultPreviewViewportRef.value
    if (!viewport) return
    viewport.scrollLeft = 0
    viewport.scrollTop = 0
  })
}

function closeResultPreview() {
  showResultPreviewModal.value = false
  resultPreviewPan.active = false
}

function zoomInResultPreview() {
  resultPreviewZoom.value = Number(clamp(resultPreviewZoom.value + 0.25, 0.5, 4).toFixed(2))
}

function zoomOutResultPreview() {
  resultPreviewZoom.value = Number(clamp(resultPreviewZoom.value - 0.25, 0.5, 4).toFixed(2))
}

function onResultPreviewWheel(event) {
  const oldZoom = Number(resultPreviewZoom.value) || 1
  const delta = event.deltaY < 0 ? 0.1 : -0.1
  const newZoom = Number(clamp(oldZoom + delta, 0.5, 4).toFixed(2))
  if (newZoom === oldZoom) return

  const viewport = resultPreviewViewportRef.value
  if (!viewport) {
    resultPreviewZoom.value = newZoom
    return
  }

  const rect = viewport.getBoundingClientRect()
  const pointerOffsetX = event.clientX - rect.left
  const pointerOffsetY = event.clientY - rect.top
  const anchorX = viewport.scrollLeft + pointerOffsetX
  const anchorY = viewport.scrollTop + pointerOffsetY
  const ratio = newZoom / oldZoom

  resultPreviewZoom.value = newZoom

  requestAnimationFrame(() => {
    viewport.scrollLeft = anchorX * ratio - pointerOffsetX
    viewport.scrollTop = anchorY * ratio - pointerOffsetY
  })
}

function onResultPreviewPointerDown(event) {
  const viewport = resultPreviewViewportRef.value
  if (!viewport) return

  resultPreviewPan.active = true
  resultPreviewPan.startX = event.clientX
  resultPreviewPan.startY = event.clientY
  resultPreviewPan.startScrollLeft = viewport.scrollLeft
  resultPreviewPan.startScrollTop = viewport.scrollTop
  viewport.setPointerCapture?.(event.pointerId)
}

function onResultPreviewPointerMove(event) {
  if (!resultPreviewPan.active) return
  const viewport = resultPreviewViewportRef.value
  if (!viewport) return

  const deltaX = event.clientX - resultPreviewPan.startX
  const deltaY = event.clientY - resultPreviewPan.startY
  viewport.scrollLeft = resultPreviewPan.startScrollLeft - deltaX
  viewport.scrollTop = resultPreviewPan.startScrollTop - deltaY
}

function onResultPreviewPointerUp(event) {
  if (!resultPreviewPan.active) return
  const viewport = resultPreviewViewportRef.value
  viewport?.releasePointerCapture?.(event.pointerId)
  resultPreviewPan.active = false
}

function calibrationBlockStyle(block, idx) {
  const active = selectedCalibrationBlockIndex.value === idx
  return {
    left: `${Number(block.x || 0) * 100}%`,
    top: `${Number(block.y || 0) * 100}%`,
    width: `${Number(block.w || 0) * 100}%`,
    height: `${Number(block.h || 0) * 100}%`,
    borderColor: active ? '#0d9488' : '#f59e0b',
    color: active ? '#0d9488' : '#b45309',
    background: active ? 'rgba(20,184,166,0.12)' : 'rgba(245,158,11,0.12)',
  }
}

function onCalibrationBlockPointerDown(idx, event) {
  if (calibrationResize.active || calibrationTouchMode.value !== 'move') return
  const block = scanCalibration.blocks?.[idx]
  if (!block) return

  selectedCalibrationBlockIndex.value = idx
  calibrationDrag.active = true
  calibrationDrag.index = idx
  calibrationDrag.startX = event.clientX
  calibrationDrag.startY = event.clientY
  calibrationDrag.originX = Number(block.x || 0)
  calibrationDrag.originY = Number(block.y || 0)
  event.currentTarget?.setPointerCapture?.(event.pointerId)
}

function onMoveHandlePointerDown(idx, event) {
  onCalibrationBlockPointerDown(idx, event)
}

function onCalibrationPointerMove(event) {
  if (calibrationGuideDrag.active && calibrationGuideDrag.index >= 0) {
    return onCalibrationGuidePointerMove(event)
  }
  if (calibrationResize.active && calibrationResize.index >= 0) {
    return onCalibrationResizePointerMove(event)
  }
  if (!calibrationDrag.active || calibrationDrag.index < 0) return

  const stage = calibrationStageRef.value
  const block = scanCalibration.blocks?.[calibrationDrag.index]
  if (!stage || !block) return

  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const dx = (event.clientX - calibrationDrag.startX) / rect.width
  const dy = (event.clientY - calibrationDrag.startY) / rect.height

  block.x = Number(clamp(calibrationDrag.originX + dx, 0, 1 - Number(block.w || 0)).toFixed(4))
  block.y = Number(clamp(calibrationDrag.originY + dy, 0, 1 - Number(block.h || 0)).toFixed(4))
}

function onCalibrationPointerUp() {
  calibrationDrag.active = false
  calibrationDrag.index = -1
  calibrationResize.active = false
  calibrationResize.index = -1
  calibrationGuideDrag.active = false
  calibrationGuideDrag.index = -1
  calibrationGuideDrag.axis = null
  calibrationGuideDrag.bandIndex = -1
}

function onGuideHandlePointerDown(idx, axis, bandIndex, event) {
  const block = scanCalibration.blocks?.[idx]
  if (!block) return

  ensureBlockGuideBands(block)
  let startValue = null
  if (axis === 'split') {
    startValue = getBlockSplitRatio(block)
  } else {
    const bands = axis === 'col' ? block.optionBands : block.rowBands
    startValue = Number(bands?.[bandIndex])
  }
  if (!Number.isFinite(startValue)) return

  selectedCalibrationBlockIndex.value = idx
  calibrationGuideDrag.active = true
  calibrationGuideDrag.index = idx
  calibrationGuideDrag.axis = axis
  calibrationGuideDrag.bandIndex = bandIndex
  calibrationGuideDrag.startX = event.clientX
  calibrationGuideDrag.startY = event.clientY
  calibrationGuideDrag.startValue = startValue
  event.currentTarget?.setPointerCapture?.(event.pointerId)
}

function onCalibrationGuidePointerMove(event) {
  if (!calibrationGuideDrag.active || calibrationGuideDrag.index < 0) return

  const stage = calibrationStageRef.value
  const block = scanCalibration.blocks?.[calibrationGuideDrag.index]
  if (!stage || !block) return

  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const axis = calibrationGuideDrag.axis
  const bandIndex = calibrationGuideDrag.bandIndex
  if (axis !== 'col' && axis !== 'row' && axis !== 'split') return

  if (axis === 'split') {
    const deltaStage = (event.clientX - calibrationGuideDrag.startX) / rect.width
    const blockScale = Number(block.w || 0)
    if (!blockScale) return
    const deltaLocal = deltaStage / blockScale
    const rawValue = calibrationGuideDrag.startValue + deltaLocal
    block.questionColW = Number(clamp(rawValue, 0.03, 0.45).toFixed(4))
    return
  }

  ensureBlockGuideBands(block)
  const bands = axis === 'col' ? block.optionBands : block.rowBands
  const blockScale = axis === 'col' ? Number(block.w || 0) : Number(block.h || 0)
  if (!blockScale) return

  const deltaStage = axis === 'col'
    ? (event.clientX - calibrationGuideDrag.startX) / rect.width
    : (event.clientY - calibrationGuideDrag.startY) / rect.height

  const optionSpan = axis === 'col' ? Math.max(0.05, 1 - getBlockSplitRatio(block)) : 1
  const deltaLocal = deltaStage / (blockScale * optionSpan)
  const rawValue = calibrationGuideDrag.startValue + deltaLocal
  const minGap = axis === 'col' ? 0.04 : 0.02
  const min = Number(bands[bandIndex - 1]) + minGap
  const max = Number(bands[bandIndex + 1]) - minGap
  bands[bandIndex] = Number(clamp(rawValue, min, max).toFixed(4))
}

function onManualAnswerChange(result, answerIndex, value) {
  if (!result || !Array.isArray(result.answers) || !result.answers[answerIndex]) return

  const normalized = String(value || '').toUpperCase()
  const detected = sanitizeAnswerChoice(normalized, result?.optionChoices || selectedOptionChoices.value) || null
  result.answers[answerIndex].detected = detected

  const parsedAnswers = {}
  result.answers.forEach((item, idx) => {
    if (item?.detected) {
      parsedAnswers[String(idx + 1)] = item.detected
    }
  })
  result.parsedAnswers = parsedAnswers

  let hasExpected = false
  let correct = 0
  let wrong = 0
  let blank = 0
  let total = 0

  result.answers.forEach((item) => {
    const expected = String(item?.expected || '').toUpperCase()
    const actual = String(item?.detected || '').toUpperCase()

    if (expected) {
      hasExpected = true
      total += 1
      if (!actual) {
        blank += 1
        item.correct = false
      } else if (actual === expected) {
        correct += 1
        item.correct = true
      } else {
        wrong += 1
        item.correct = false
      }
      return
    }

    item.correct = null
    if (!actual) blank += 1
  })

  if (hasExpected && total > 0) {
    result.correct = correct
    result.wrong = wrong
    result.blank = Math.max(0, blank)
    result.score = Number(((correct / total) * 100).toFixed(2))
  }
}

function onResizeHandlePointerDown(idx, handle, event) {
  const block = scanCalibration.blocks?.[idx]
  if (!block) return

  selectedCalibrationBlockIndex.value = idx
  calibrationResize.active = true
  calibrationResize.index = idx
  calibrationResize.handle = handle
  calibrationResize.startX = event.clientX
  calibrationResize.startY = event.clientY
  calibrationResize.originX = Number(block.x || 0)
  calibrationResize.originY = Number(block.y || 0)
  calibrationResize.originW = Number(block.w || 0)
  calibrationResize.originH = Number(block.h || 0)
  event.currentTarget?.setPointerCapture?.(event.pointerId)
  event.preventDefault()
  event.stopPropagation()
}

function onCalibrationResizePointerMove(event) {
  if (!calibrationResize.active || calibrationResize.index < 0) return

  const stage = calibrationStageRef.value
  const block = scanCalibration.blocks?.[calibrationResize.index]
  if (!stage || !block) return

  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const dx = (event.clientX - calibrationResize.startX) / rect.width
  const dy = (event.clientY - calibrationResize.startY) / rect.height
  const handle = calibrationResize.handle
  const minSize = 0.04

  // Calculate new dimensions based on which handle is being dragged
  let newX = calibrationResize.originX
  let newY = calibrationResize.originY
  let newW = calibrationResize.originW
  let newH = calibrationResize.originH

  if (handle.includes('w')) {
    // Left edge
    const delta = clamp(calibrationResize.originX + dx, 0, calibrationResize.originX + calibrationResize.originW - minSize)
    newW = calibrationResize.originW - (delta - calibrationResize.originX)
    newX = delta
  }
  if (handle.includes('e')) {
    // Right edge
    newW = clamp(calibrationResize.originW + dx, minSize, 1 - calibrationResize.originX)
  }
  if (handle.includes('n')) {
    // Top edge
    const delta = clamp(calibrationResize.originY + dy, 0, calibrationResize.originY + calibrationResize.originH - minSize)
    newH = calibrationResize.originH - (delta - calibrationResize.originY)
    newY = delta
  }
  if (handle.includes('s')) {
    // Bottom edge
    newH = clamp(calibrationResize.originH + dy, minSize, 1 - calibrationResize.originY)
  }

  block.x = Number(newX.toFixed(4))
  block.y = Number(newY.toFixed(4))
  block.w = Number(newW.toFixed(4))
  block.h = Number(newH.toFixed(4))
}

function selectBlockByStartQ(startQ) {
  const idx = scanCalibration.blocks.findIndex((b) => Number(b?.startQ) === Number(startQ))
  if (idx >= 0) selectedCalibrationBlockIndex.value = idx
}

async function rescanAfterCalibrate() {
  if (!previewFile.value || scanning.value) return
  await doScan()
}

function nudgeGlobalCalibration(field, direction) {
  const step = Number(calibrationStep.value) || 0.01
  const current = Number(scanCalibration[field] || 0)
  const next = current + step * direction

  if (field === 'centerPadX' || field === 'centerPadY') {
    scanCalibration[field] = Number(clamp(next, 0, 0.5).toFixed(4))
    return
  }
  if (field === 'questionColW') {
    scanCalibration[field] = Number(clamp(next, 0.02, 0.3).toFixed(4))
  }
}

function nudgeBlock(field, direction) {
  const block = selectedCalibrationBlock.value
  if (!block) return

  const step = Number(calibrationStep.value) || 0.01
  const next = Number(block[field] || 0) + step * direction

  if (field === 'x' || field === 'y' || field === 'rowTop' || field === 'rowBottom') {
    block[field] = Number(clamp(next, 0, 1).toFixed(4))
  } else if (field === 'w' || field === 'h') {
    block[field] = Number(clamp(next, 0.01, 1).toFixed(4))
  } else if (field === 'questionColW') {
    block[field] = Number(clamp(next, 0.02, 0.3).toFixed(4))
  }

  if (block.rowTop >= block.rowBottom) {
    block.rowBottom = Number(clamp(block.rowTop + 0.05, 0.1, 1).toFixed(4))
  }
}

function hapticFeedback() {
  if (typeof navigator?.vibrate === 'function') {
    navigator.vibrate(10)
  }
}

function showDimensionTooltip(block, x, y) {
  if (!block) return
  calibrationDimensionTooltip.text = `W: ${(block.w * 100).toFixed(1)}% · H: ${(block.h * 100).toFixed(1)}%`
  calibrationDimensionTooltip.x = x
  calibrationDimensionTooltip.y = y
  calibrationDimensionTooltip.visible = true
}

function hideDimensionTooltip() {
  calibrationDimensionTooltip.visible = false
}

function handleCalibrationBlockDoubleClick(idx) {
  selectedCalibrationBlockIndex.value = idx
  hapticFeedback()
}

function handleCalibrationBlockLongPress(idx, event) {
  if (calibrationLongPressTimer.value) clearTimeout(calibrationLongPressTimer.value)
  
  calibrationLongPressTimer.value = setTimeout(() => {
    hapticFeedback()
    calibrationContextMenu.blockIndex = idx
    calibrationContextMenu.x = event.clientX || event.touches?.[0]?.clientX || 0
    calibrationContextMenu.y = event.clientY || event.touches?.[0]?.clientY || 0
    calibrationContextMenu.visible = true
  }, 500)
}

function clearLongPressTimer() {
  if (calibrationLongPressTimer.value) {
    clearTimeout(calibrationLongPressTimer.value)
    calibrationLongPressTimer.value = null
  }
}

function handleContextMenuAction(action) {
  const block = scanCalibration.blocks?.[calibrationContextMenu.blockIndex]
  if (!block) return

  if (action === 'reset') {
    const template = buildDefaultScanCalibration(questionTotal.value)
    const defaultBlock = template.blocks?.[calibrationContextMenu.blockIndex]
    if (defaultBlock) {
      Object.assign(block, defaultBlock)
    }
  } else if (action === 'lockAspect') {
    calibrationAspectLocked.value = !calibrationAspectLocked.value
  } else if (action === 'autofit') {
    block.w = Number((0.25 / Math.max(1, block.count)).toFixed(4))
    block.h = Number((0.3 / Math.max(1, Math.ceil(block.count / 10))).toFixed(4))
  }

  calibrationContextMenu.visible = false
}

function adjustBlockSlider(block, field, value) {
  if (!block) return
  const numValue = Number(value)
  
  if (field === 'w' || field === 'h') {
    const oldValue = block[field]
    block[field] = Number(clamp(numValue, 0.01, 1).toFixed(4))
    
    if (calibrationAspectLocked.value && oldValue) {
      const ratio = block[field] / oldValue
      const otherField = field === 'w' ? 'h' : 'w'
      block[otherField] = Number(clamp(block[otherField] * ratio, 0.01, 1).toFixed(4))
    }
  } else if (field === 'x' || field === 'y') {
    block[field] = Number(clamp(numValue, 0, 1).toFixed(4))
  } else if (field === 'rowTop' || field === 'rowBottom') {
    block[field] = Number(clamp(numValue, 0, 1).toFixed(4))
    if (block.rowTop >= block.rowBottom) {
      block.rowBottom = Number(clamp(block.rowTop + 0.05, 0.1, 1).toFixed(4))
    }
  }
}

function quickAdjustBlock(field, percentDelta) {
  const block = selectedCalibrationBlock.value
  if (!block) return
  
  const delta = Number(block[field] || 0) * (percentDelta / 100)
  adjustBlockSlider(block, field, Number(block[field] || 0) + delta)
}

function handlePinchStart(event) {
  if (event.touches && event.touches.length === 2) {
    const dx = event.touches[0].clientX - event.touches[1].clientX
    const dy = event.touches[0].clientY - event.touches[1].clientY
    calibrationPinchStartDistance.value = Math.sqrt(dx * dx + dy * dy)
    calibrationZoomAtPinchStart.value = calibrationZoom.value
  }
}

function handlePinchMove(event) {
  if (event.touches && event.touches.length === 2 && calibrationPinchStartDistance.value > 0) {
    event.preventDefault()
    const dx = event.touches[0].clientX - event.touches[1].clientX
    const dy = event.touches[0].clientY - event.touches[1].clientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const ratio = distance / calibrationPinchStartDistance.value
    calibrationZoom.value = Number(clamp(calibrationZoomAtPinchStart.value * ratio, 1, 5).toFixed(2))
  }
}

function handlePinchEnd() {
  calibrationPinchStartDistance.value = 0
}

function detachCalibrationPinchListeners(stage = calibrationStageRef.value) {
  if (!stage) return
  stage.removeEventListener('touchstart', handlePinchStart)
  stage.removeEventListener('touchmove', handlePinchMove)
  stage.removeEventListener('touchend', handlePinchEnd)
  stage.removeEventListener('touchcancel', handlePinchEnd)
}

function attachCalibrationPinchListeners() {
  const stage = calibrationStageRef.value
  if (!stage) return

  detachCalibrationPinchListeners(stage)
  stage.addEventListener('touchstart', handlePinchStart, { passive: false })
  stage.addEventListener('touchmove', handlePinchMove, { passive: false })
  stage.addEventListener('touchend', handlePinchEnd, { passive: true })
  stage.addEventListener('touchcancel', handlePinchEnd, { passive: true })
}

function handleSwipeBlock(direction, blockIndex) {
  if (direction === 'left') {
    const nextIdx = (blockIndex + 1) % scanCalibration.blocks.length
    selectedCalibrationBlockIndex.value = nextIdx
  } else if (direction === 'right') {
    const prevIdx = (blockIndex - 1 + scanCalibration.blocks.length) % scanCalibration.blocks.length
    selectedCalibrationBlockIndex.value = prevIdx
  }
  hapticFeedback()
}

onMounted(() => {
  calibrationIsLandscape.value = window.innerWidth > window.innerHeight
  window.addEventListener('orientationchange', () => {
    calibrationIsLandscape.value = window.innerWidth > window.innerHeight
  })

  // The preview stage is rendered with v-if and can be recreated, so make sure
  // pinch listeners are (re)attached after each mount/update of the stage node.
  nextTick(() => {
    attachCalibrationPinchListeners()
  })
})

watch(
  () => calibrationStageRef.value,
  (stage, previousStage) => {
    if (previousStage) {
      detachCalibrationPinchListeners(previousStage)
    }
    if (stage) {
      nextTick(() => {
        attachCalibrationPinchListeners()
      })
    }
  }
)

onUnmounted(() => {
  detachCalibrationPinchListeners()
})

async function loadCalibrationDefaults() {
  try {
    const optionChoices = normalizeOptionChoices(selectedOptionChoices.value)
    const res = await ocrGetCalibration({ total: questionTotal.value, optionChoices })
    selectedOptionChoices.value = normalizeOptionChoices(res.data?.optionChoices || optionChoices)
    applyCalibration(res.data?.calibration || res.data)
  } catch {
    applyCalibration(buildDefaultScanCalibration(questionTotal.value))
  }
}

function resetCalibration() {
  applyCalibration(buildDefaultScanCalibration(questionTotal.value))
  scanRotation.value = 0
}

async function loadCurrentTemplate() {
  try {
    const res = await ocrTemplateCurrent()
    if (res.data?.registered && res.data.template) {
      templateRegistered.value = res.data.template
    } else {
      templateRegistered.value = null
    }
  } catch {
    templateRegistered.value = null
  }
}

async function uploadTemplate(event) {
  const file = event?.target?.files?.[0]
  if (!file) return
  event.target.value = ''

  if (!file.name.toLowerCase().endsWith('.docx')) {
    templateError.value = 'Hanya file DOCX yang didukung.'
    return
  }

  templateLoading.value = true
  templateError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file, file.name)
    const res = await ocrTemplateRegister(fd)
    const tmpl = res.data?.template
    if (tmpl) {
      templateRegistered.value = tmpl
      // Apply the detected calibration to the live calibration state
      selectedQuestionTotal.value = tmpl.total
      selectedOptionChoices.value = tmpl.optionChoices
      await nextTick()
      applyCalibration(tmpl.calibration)
    }
  } catch (err) {
    templateError.value = err?.response?.data?.error || err?.message || 'Gagal mendaftarkan template.'
  } finally {
    templateLoading.value = false
  }
}

async function removeTemplate() {
  try {
    await ocrTemplateDelete()
    templateRegistered.value = null
  } catch {
    // ignore
  }
}

function applyRegisteredTemplate() {
  if (!templateRegistered.value?.calibration) return
  const tmpl = templateRegistered.value
  selectedQuestionTotal.value = tmpl.total
  selectedOptionChoices.value = tmpl.optionChoices
  applyCalibration(tmpl.calibration)
}

function toNumberOrNull(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toPositiveIntOrNull(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const normalized = Math.trunc(n)
  return normalized > 0 ? normalized : null
}

function buildAnswersFromResult(result, scoreObj) {
  const parsed = result?.parsedAnswers && typeof result.parsedAnswers === 'object' ? result.parsedAnswers : {}
  const details = scoreObj?.details && typeof scoreObj.details === 'object' ? scoreObj.details : {}
  const maxFromParsed = Object.keys(parsed).reduce((m, k) => Math.max(m, Number(k) || 0), 0)
  const maxFromDetails = Object.keys(details).reduce((m, k) => Math.max(m, Number(k) || 0), 0)
  const total = Math.max(questionTotal.value, maxFromParsed, maxFromDetails)

  return Array.from({ length: total }, (_, idx) => {
    const qn = idx + 1
    const detail = details[qn] || details[String(qn)] || null
    const detected = detail?.actual ?? parsed[qn] ?? parsed[String(qn)] ?? null
    const expected = detail?.expected ?? null
    const correct = typeof detail?.correct === 'boolean' ? detail.correct : null
    return { detected, expected, correct }
  })
}

function normalizeScanResult(result) {
  const scoreObj = result?.score && typeof result.score === 'object' ? result.score : null
  const scoreRaw = scoreObj?.score ?? result?.score
  const score = toNumberOrNull(scoreRaw)
  const correct = toNumberOrNull(scoreObj?.correct ?? result?.correct) ?? 0
  const wrong = toNumberOrNull(scoreObj?.wrong ?? result?.wrong) ?? 0
  const total = toNumberOrNull(scoreObj?.total ?? result?.total) ?? questionTotal.value
  const blank = toNumberOrNull(result?.blank) ?? Math.max(0, total - correct - wrong)
  const optionChoices = normalizeOptionChoices(result?.optionChoices || selectedOptionChoices.value)
  const answers = buildAnswersFromResult(result, scoreObj)

  return {
    ...(result || {}),
    filename: result?.filename || result?.fileName || null,
    score,
    correct,
    wrong,
    blank,
    optionChoices,
    calibration: result?.calibration ? { ...result.calibration, optionChoices } : result?.calibration,
    answers,
    previewUrl: result?.debug?.overlayImage || result?.debug?.processedImage || result?.debug?.sourceImage || result?.previewUrl || null,
  }
}

function addResultContext(result) {
  return {
    ...normalizeScanResult(result),
    metaContext: buildResultContext(),
  }
}

function getResultContext(result) {
  return result?.metaContext || buildResultContext()
}

function snapshotResultForBuffer(result) {
  if (!result || typeof result !== 'object') return null

  return {
    filename: result.filename || result.fileName || null,
    fileName: result.fileName || result.filename || null,
    score: toNumberOrNull(result.score),
    correct: toNumberOrNull(result.correct),
    wrong: toNumberOrNull(result.wrong),
    blank: toNumberOrNull(result.blank),
    method: result.method || null,
    source: result.source || null,
    optionChoices: normalizeOptionChoices(result.optionChoices || selectedOptionChoices.value),
    sectionInfo: result?.sectionInfo && typeof result.sectionInfo === 'object'
      ? {
        section: result.sectionInfo.section || null,
        visibleBlockCount: toNumberOrNull(result.sectionInfo.visibleBlockCount),
      }
      : null,
    parsedAnswers: result?.parsedAnswers && typeof result.parsedAnswers === 'object' ? result.parsedAnswers : {},
    answers: Array.isArray(result.answers)
      ? result.answers.map((item) => ({
        detected: item?.detected || null,
        expected: item?.expected || null,
        correct: typeof item?.correct === 'boolean' ? item.correct : null,
      }))
      : [],
    rawText: result.rawText || null,
    resultLinkId: toPositiveIntOrNull(result.resultLinkId),
    bufferKey: result.bufferKey || null,
    metaContext: result?.metaContext && typeof result.metaContext === 'object'
      ? {
        lessonId: toPositiveIntOrNull(result.metaContext.lessonId),
        lessonName: result.metaContext.lessonName || null,
        classId: toPositiveIntOrNull(result.metaContext.classId),
        className: result.metaContext.className || null,
        teacherId: toPositiveIntOrNull(result.metaContext.teacherId),
        teacherName: result.metaContext.teacherName || null,
        students: Array.isArray(result.metaContext.students) ? result.metaContext.students : [],
      }
      : buildResultContext(),
  }
}

function hydrateResultFromBuffer(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null
  const normalized = normalizeScanResult(snapshot)
  return {
    ...normalized,
    source: snapshot.source || normalized.source || null,
    resultLinkId: toPositiveIntOrNull(snapshot.resultLinkId),
    bufferKey: snapshot.bufferKey || null,
    metaContext: snapshot?.metaContext && typeof snapshot.metaContext === 'object'
      ? snapshot.metaContext
      : buildResultContext(),
  }
}

function persistScanBuffer() {
  if (typeof window === 'undefined' || !window.localStorage) return

  try {
    const payload = {
      version: 1,
      activeScanMode: activeScanMode.value,
      selectedQuestionTotal: selectedQuestionTotal.value,
      selectedOptionChoices: selectedOptionChoices.value,
      scanRotation: scanRotation.value,
      selectedAnswerKeyId: selectedAnswerKeyId.value,
      lessonType: lessonType.value,
      selectedLessonId: selectedLessonId.value,
      selectedClassId: selectedClassId.value,
      selectedTeacherId: selectedTeacherId.value,
      scanCalibration: cloneCalibration(scanCalibration),
      lastResult: snapshotResultForBuffer(lastResult.value),
      bulkResults: Array.isArray(bulkResults.value)
        ? bulkResults.value.slice(0, 30).map(snapshotResultForBuffer).filter(Boolean)
        : [],
      saveFailures: Array.isArray(saveFailures.value)
        ? saveFailures.value.map((item) => ({
          id: item.id,
          source: item.source,
          result: snapshotResultForBuffer(item.result),
        })).filter((item) => item.result)
        : [],
      previewDraft: previewDraft.value,
      uploadFileDrafts: Array.isArray(uploadFileDrafts.value)
        ? uploadFileDrafts.value.slice(0, OCR_UPLOAD_DRAFT_LIMIT)
        : [],
      selectedStudentByResult: { ...selectedStudentByResult },
      lastUpdatedAt: Date.now(),
    }

    window.localStorage.setItem(OCR_SCAN_BUFFER_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

function restoreScanBuffer() {
  if (typeof window === 'undefined' || !window.localStorage) return { hasCalibration: false }

  try {
    const raw = window.localStorage.getItem(OCR_SCAN_BUFFER_KEY)
    if (!raw) return { hasCalibration: false }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { hasCalibration: false }

    if (Number.isFinite(Number(parsed.selectedQuestionTotal))) {
      selectedQuestionTotal.value = Number(parsed.selectedQuestionTotal)
    }
    if (parsed.selectedOptionChoices) {
      selectedOptionChoices.value = normalizeOptionChoices(parsed.selectedOptionChoices)
    }
    if (Number.isFinite(Number(parsed.scanRotation))) {
      scanRotation.value = Number(parsed.scanRotation)
    }
    if (parsed.activeScanMode === 'camera' || parsed.activeScanMode === 'upload' || parsed.activeScanMode === 'scanner') {
      activeScanMode.value = parsed.activeScanMode
    }

    selectedAnswerKeyId.value = parsed.selectedAnswerKeyId || null
    lessonType.value = parsed.lessonType || lessonType.value
    selectedLessonId.value = parsed.selectedLessonId || null
    selectedClassId.value = parsed.selectedClassId || null
    selectedTeacherId.value = parsed.selectedTeacherId || null

    const hasCalibration = !!(parsed.scanCalibration && typeof parsed.scanCalibration === 'object')
    if (hasCalibration) {
      applyCalibration(parsed.scanCalibration)
    }

    lastResult.value = hydrateResultFromBuffer(parsed.lastResult)
    bulkResults.value = Array.isArray(parsed.bulkResults)
      ? parsed.bulkResults.map(hydrateResultFromBuffer).filter(Boolean)
      : []

    saveFailures.value = Array.isArray(parsed.saveFailures)
      ? parsed.saveFailures
        .map((item) => ({
          id: item?.id || `recover-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          source: item?.source || 'scan',
          result: hydrateResultFromBuffer(item?.result),
        }))
        .filter((item) => item.result)
      : []

    previewDraft.value = parsed.previewDraft && typeof parsed.previewDraft === 'object'
      ? parsed.previewDraft
      : null
    if (previewDraft.value?.dataUrl) {
      previewSrc.value = previewDraft.value.dataUrl
      previewFile.value = fileFromDraft(previewDraft.value)
    }

    uploadFileDrafts.value = Array.isArray(parsed.uploadFileDrafts)
      ? parsed.uploadFileDrafts.filter((item) => item && typeof item === 'object' && item.dataUrl)
      : []
    uploadFiles.value = uploadFileDrafts.value.map((draft) => fileFromDraft(draft)).filter(Boolean)

    if (parsed.selectedStudentByResult && typeof parsed.selectedStudentByResult === 'object') {
      Object.entries(parsed.selectedStudentByResult).forEach(([key, value]) => {
        const studentId = Number(value || 0)
        selectedStudentByResult[key] = Number.isFinite(studentId) && studentId > 0 ? studentId : null
      })
    }

    return { hasCalibration }
  } catch {
    return { hasCalibration: false }
  }
}

const savedResultGroups = computed(() => {
  const map = new Map()

  for (const item of savedResultLinks.value) {
    const lessonName = item?.lesson?.name || 'Pelajaran belum dipilih'
    const kelasName = item?.kelas ? classLabel(item.kelas) : 'Kelas belum dipilih'
    const key = `${item?.lesson_id || 0}-${item?.kelas_id || 0}`

    if (!map.has(key)) {
      map.set(key, {
        key,
        lessonName,
        kelasName,
        teacherName: item?.teacher?.name || 'Guru belum dipilih',
        students: Array.isArray(item?.kelas?.students) ? item.kelas.students : [],
        results: [],
      })
    }

    const group = map.get(key)
    if (!group.teacherName || group.teacherName === 'Guru belum dipilih') {
      group.teacherName = item?.teacher?.name || group.teacherName
    }
    if ((!group.students || group.students.length === 0) && Array.isArray(item?.kelas?.students)) {
      group.students = item.kelas.students
    }

    group.results.push(item)
  }

  return Array.from(map.values())
})
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.calibration-block {
  z-index: 20;
  touch-action: none;
  background: transparent;
}

.calib-slider:disabled {
  opacity: 0.35;
  pointer-events: none;
  cursor: not-allowed;
}

.top-guide-rail {
  position: absolute;
  left: 0;
  right: 0;
  top: -28px;
  height: 24px;
  pointer-events: none;
}

.left-guide-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -24px;
  width: 24px;
  pointer-events: none;
}

.move-handle {
  position: absolute;
  left: 6px;
  top: 0;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(15, 23, 42, 0.8);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.01em;
  pointer-events: auto;
  touch-action: none;
}

.resize-handle {
  position: absolute;
  border: none;
  padding: 0;
  background: transparent;
  touch-action: none;
}

.resize-handle.corner {
  width: 22px;
  height: 22px;
  margin: -11px;
}

.resize-handle.corner::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 11px;
  height: 11px;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: #ef4444;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.resize-handle.edge {
  background: transparent;
}

.resize-handle.n {
  top: 0;
  left: 16%;
  width: 68%;
  height: 16px;
  transform: translateY(-50%);
  cursor: ns-resize;
}

.resize-handle.s {
  bottom: 0;
  left: 16%;
  width: 68%;
  height: 16px;
  transform: translateY(50%);
  cursor: ns-resize;
}

.resize-handle.w {
  left: 0;
  top: 16%;
  width: 16px;
  height: 68%;
  transform: translateX(-50%);
  cursor: ew-resize;
}

.resize-handle.e {
  right: 0;
  top: 16%;
  width: 16px;
  height: 68%;
  transform: translateX(50%);
  cursor: ew-resize;
}

.resize-handle.nw {
  left: 0;
  top: 0;
  cursor: nwse-resize;
}

.resize-handle.ne {
  right: 0;
  top: 0;
  cursor: nesw-resize;
}

.resize-handle.sw {
  left: 0;
  bottom: 0;
  cursor: nesw-resize;
}

.resize-handle.se {
  right: 0;
  bottom: 0;
  cursor: nwse-resize;
}

.guide-handle {
  position: absolute;
  border: none;
  padding: 0;
  background: transparent;
  touch-action: none;
}

.guide-handle.col {
  top: 0;
  bottom: 0;
  width: 16px;
  transform: translateX(-50%);
  cursor: ew-resize;
}

.guide-handle.col::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(20, 184, 166, 0.9);
}

.guide-handle.row {
  left: 0;
  right: 0;
  height: 16px;
  transform: translateY(-50%);
  cursor: ns-resize;
}

.guide-handle.row.left {
  left: 50%;
  right: auto;
  width: 22px;
  height: 18px;
  transform: translate(-50%, -50%);
}

.guide-handle.row::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  transform: translateY(-50%);
  background: rgba(20, 184, 166, 0.9);
}

.guide-handle.split {
  top: 0;
  bottom: 0;
  width: 16px;
  transform: translateX(-50%);
  cursor: ew-resize;
}

.guide-handle.split::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  transform: translateX(-50%);
  background: rgba(245, 158, 11, 0.95);
}

.guide-handle.top {
  top: 0;
  bottom: auto;
  height: 22px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.guide-handle.col.top,
.guide-handle.split.top {
  width: 18px;
}

.guide-handle.col.top::after,
.guide-handle.split.top::after {
  top: 3px;
  bottom: 2px;
}

.guide-handle.row.top {
  left: auto;
  right: auto;
  top: 0;
  height: 22px;
  width: 14px;
  transform: translateX(-50%);
}

.guide-handle.row.left::after {
  left: 50%;
  top: 50%;
  width: 16px;
  height: 2px;
  transform: translate(-50%, -50%);
}

.guide-handle.row.top::after {
  left: 50%;
  right: auto;
  width: 2px;
  height: 16px;
  transform: translateX(-50%);
}

.calib-col-badge {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
  line-height: 1.1;
  padding: 1px 4px;
}

.calib-row-badge {
  position: absolute;
  left: 4px;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 6px;
  line-height: 1;
  padding: 2px 4px;
}

@media (max-width: 768px), (pointer: coarse) {
  .top-guide-rail {
    top: -36px;
    height: 32px;
  }

  .move-handle {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }

  .resize-handle.corner {
    width: 30px;
    height: 30px;
    margin: -15px;
  }

  .resize-handle.corner::after {
    width: 14px;
    height: 14px;
  }

  .resize-handle.n,
  .resize-handle.s {
    height: 24px;
  }

  .resize-handle.w,
  .resize-handle.e {
    width: 24px;
  }

  .guide-handle.top {
    height: 30px;
  }

  .guide-handle.col.top,
  .guide-handle.split.top {
    width: 24px;
  }

  .guide-handle.row.top {
    width: 22px;
  }

  .guide-handle.row.top::after {
    height: 22px;
  }

  .left-guide-rail {
    left: -20px;
    width: 20px;
  }

  .guide-handle.row.left {
    width: 20px;
    height: 20px;
  }

  .left-guide-rail {
    left: -20px;
    width: 20px;
  }

  .guide-handle.row.left {
    width: 20px;
    height: 20px;
  }
}

/* Mobile Touch Optimization */
@media (hover: none) and (pointer: coarse) {
  /* Larger touch targets on mobile */
  .move-handle {
    height: 28px;
    padding: 0 12px;
    min-width: 32px;
    font-size: 12px;
  }

  .resize-handle.corner {
    width: 32px;
    height: 32px;
    margin: -16px;
  }

  .resize-handle.n,
  .resize-handle.s {
    height: 24px;
  }

  .resize-handle.w,
  .resize-handle.e {
    width: 24px;
  }

  .guide-handle {
    background: rgba(0, 0, 0, 0.05);
  }

  .guide-handle.col,
  .guide-handle.row,
  .guide-handle.split {
    min-width: 24px;
    min-height: 24px;
  }

  input[type="range"] {
    height: 28px;
    cursor: pointer;
  }

  button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Landscape mode optimizations */
@media (orientation: landscape) {
  .calibration-container {
    gap: 12px;
  }

  .calibration-controls {
    max-height: 30vh;
    overflow-y: auto;
  }
}

/* Dimension tooltip */
.dimension-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Context menu */
.calibration-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 140px;
}

.calibration-context-menu button {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.calibration-context-menu button:hover {
  background: #f3f4f6;
}

.calibration-context-menu button:first-child {
  border-radius: 8px 8px 0 0;
}

.calibration-context-menu button:last-child {
  border-radius: 0 0 8px 8px;
}

.calibration-context-menu button + button {
  border-top: 1px solid #e5e7eb;
}

/* Slider styling for better mobile UX */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #e5e7eb;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
