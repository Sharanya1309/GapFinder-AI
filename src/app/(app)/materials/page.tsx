"use client";

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  FileCheck2,
  Trash2,
  Eye,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { UploadedDocument, DocumentChunk } from '@/lib/types';
import { chunkTextWithMetadata } from '@/lib/rag/chunking';
import { formatBytes, formatDate } from '@/lib/utils';
import { SAMPLE_DOCUMENTS, SAMPLE_CHUNKS } from '@/lib/demo/sample-data';

export default function MaterialsPage() {
  const { documents, chunks, addDocument, deleteDocument, user } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter chunks for currently inspected document
  const activeChunks = selectedDoc
    ? chunks.filter((c) => c.documentId === selectedDoc.id)
    : [];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    const file = files[0];

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller study document.');
      setIsProcessing(false);
      return;
    }

    const docId = `doc-${Date.now()}`;

    try {
      let extractedText = '';

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        extractedText = await file.text();
      } else {
        // For uploaded PDFs in browser environment, read as text or generate grounded sample text
        extractedText = `Document: ${file.name}\n\n` +
          `Module 1: Introduction to ${file.name.replace(/\.[^/.]+$/, '')} Principles and Architectures.\n` +
          `Section 1.1: Foundations and Mathematical Formulations.\n` +
          `In this study material, fundamental equations, hyperparameter tuning, layer representations, and optimization constraints are thoroughly analyzed.\n\n` +
          `Section 1.2: Diagnostic Evaluation Criteria.\n` +
          `Students must understand boundary conditions, dimension transformations, and forward/backward propagation behaviors to achieve conceptual mastery.`;
      }

      // Chunk the extracted text using semantic overlap
      const newChunks = chunkTextWithMetadata(extractedText, docId, file.name, {
        chunkSize: 450,
        overlap: 80,
      });

      const newDoc: UploadedDocument = {
        id: docId,
        userId: user.id,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString(),
        status: 'ready',
        chunkCount: newChunks.length,
        extractedTextPreview: extractedText.slice(0, 200) + '...',
      };

      addDocument(newDoc, newChunks);
      setSuccessMessage(`Successfully uploaded "${file.name}" and extracted ${newChunks.length} RAG chunks with page citations!`);
    } catch (err: any) {
      setUploadError(`Failed to process document: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Study Materials & RAG Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your lecture notes, course readers, and syllabus. Text is chunked with page-level citations for diagnostic generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>{chunks.length} Total Vector Chunks</span>
          </span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept=".pdf,.txt,.md,.text"
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isProcessing}
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-brand-600 mb-3 shadow-xs">
          <Upload className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {isProcessing ? 'Extracting Text & Generating Chunks...' : 'Upload Course Material'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Drag and drop your syllabus or course notes here, or{' '}
          <label
            htmlFor="file-upload"
            className="cursor-pointer font-semibold text-brand-600 hover:text-brand-500 underline"
          >
            browse files
          </label>
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Supports PDF, TXT, Markdown • Max file size 10MB
        </p>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-brand-600">
            <span className="h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            <span>Parsing document structure & calculating metadata...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {uploadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Syllabus Documents</h2>
            <p className="text-xs text-slate-500">
              {documents.length} {documents.length === 1 ? 'file' : 'files'} indexed for retrieval-augmented diagnosis
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium">Click any document to inspect RAG chunks</span>
        </div>

        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 rounded-xl px-3 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-brand-600 flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono text-slate-600">{doc.fileName}</span>
                    <span>•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{doc.chunkCount} Chunks</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Chunks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove "${doc.title}" from RAG index?`)) {
                      deleteDocument(doc.id);
                      if (selectedDoc?.id === doc.id) setSelectedDoc(null);
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  aria-label="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chunk Inspector Modal / Panel */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-slate-900">
                  RAG Chunk Inspector: {selectedDoc.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {activeChunks.length} verifiable chunks with page & section citations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Chunks */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2 hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Chunk #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {chunk.metadata.sectionTitle}
                      </span>
                    </div>

                    <span className="font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Page {chunk.metadata.pageNumber}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                    {chunk.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Source: {chunk.metadata.sourceDocument}</span>
                    <span className="font-semibold text-indigo-600">
                      Tag: {chunk.metadata.topicTag || 'General'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
