import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, Calendar, Package, CreditCard, MapPin, FileText } from 'lucide-react';

/**
 * Responsive Leads Table Component
 * - Desktop: Full table with all columns
 * - Mobile: Stripped down to Name, Phone, Status
 * - Click/tap row to see full details in modal
 */
export default function LeadsTable({
  leads,
  loading,
  activeTab,
  formatDate,
  getCategoryBadge,
  getStatusBadge,
  handleDeleteLead
}) {
  const [selectedLead, setSelectedLead] = useState(null);

  // Handle row click/tap to open detail modal
  const handleRowClick = (lead) => {
    setSelectedLead(lead);
  };

  const closeModal = () => {
    setSelectedLead(null);
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-[20px]">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-text font-medium">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[20px]">
        <svg className="w-16 h-16 mx-auto text-gray-text mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-text font-medium">No leads found</p>
      </div>
    );
  }

  return (
    <>
      {/* Responsive Table Container */}
      <div className="bg-white rounded-xl sm:rounded-[20px] shadow-sm border border-gray-200 overflow-clip">
        <div className="lg:overflow-x-auto">
          <table className="w-full">
            {/* Sticky Header */}
            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
              <tr>
                {/* Always visible columns */}
                <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-dark uppercase tracking-wider">
                  Name
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-dark uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-dark uppercase tracking-wider">
                  Status
                </th>

                {/* Desktop-only columns (show all at lg: 1024px+) */}
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-dark uppercase tracking-wider">
                  Date
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-bold text-dark uppercase tracking-wider">
                  Category
                </th>
                <th className="hidden lg:table-cell px-6 py-4 text-right text-xs font-bold text-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {leads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleRowClick(lead)}
                  className={`
                    hover:bg-gray-50 transition-colors duration-200 cursor-pointer
                    ${lead.category === 'Test Ride' || lead.category === '99 Offer' ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''}
                    ${lead.category === 'Contact' ? 'bg-red-50/30 border-l-4 border-red-500' : ''}
                  `}
                  title="Click for details"
                >
                  {/* Name Column - Always visible */}
                  <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div className="font-bold text-dark text-sm lg:text-base">{lead.name}</div>
                    {lead.email && (
                      <div className="text-xs text-gray-text lowercase hidden lg:block mt-0.5">{lead.email}</div>
                    )}
                    {lead.quizAnswers?.interestedProduct && (
                      <div className="text-xs font-bold text-primary mt-1 uppercase hidden lg:block">
                        📦 {lead.quizAnswers.interestedProduct}
                      </div>
                    )}
                    {/* Mobile: Show date under name */}
                    <div className="text-xs text-gray-text mt-1.5 lg:hidden">
                      📅 {formatDate(lead.createdAt)}
                    </div>
                  </td>

                  {/* Phone Column - Always visible */}
                  <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:text-primary-dark font-medium flex items-center gap-2 group text-sm"
                    >
                      <Phone className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="font-mono">{lead.phone}</span>
                    </a>
                  </td>

                  {/* Status Column - Always visible */}
                  <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <span className={`px-2.5 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-wide border inline-block ${getStatusBadge(lead.payment?.status || 'UNPAID')}`}>
                      {lead.payment?.status || 'UNPAID'}
                    </span>
                  </td>

                  {/* Date Column - Desktop only (lg+) */}
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-text">
                    {formatDate(lead.createdAt)}
                  </td>

                  {/* Category Column - Desktop only (lg+) */}
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(lead.category || 'General', lead)}
                  </td>

                  {/* Actions Column - Desktop only (lg+) */}
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLead(lead.id, lead.name);
                      }}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50 disabled:opacity-50"
                      title="Delete Lead"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile hint */}
        <div className="lg:hidden bg-blue-50 border-t-2 border-blue-200 px-4 py-3 text-center">
          <p className="text-xs text-dark font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><span className="font-bold text-primary">Tap</span> any row to view full details</span>
          </p>
        </div>
      </div>

      {/* Full-Screen Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full md:max-w-2xl md:rounded-[30px] rounded-t-[30px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-[30px]">
                <h2 className="font-display text-2xl text-dark uppercase tracking-wide">Lead Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-dark" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                  <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                    Contact Information
                  </h3>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">Name</p>
                      <p className="text-lg font-bold text-dark">{selectedLead.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">Phone</p>
                      <a href={`tel:${selectedLead.phone}`} className="text-lg font-bold text-primary hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                  </div>

                  {selectedLead.email && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Email</p>
                        <a href={`mailto:${selectedLead.email}`} className="text-base text-primary hover:underline lowercase">
                          {selectedLead.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">Date</p>
                      <p className="text-base text-dark">{formatDate(selectedLead.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Category & Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-[20px] p-4">
                    <p className="text-xs text-gray-text uppercase font-bold mb-2">Category</p>
                    {getCategoryBadge(selectedLead.category || 'General', selectedLead)}
                  </div>
                  <div className="bg-gray-50 rounded-[20px] p-4">
                    <p className="text-xs text-gray-text uppercase font-bold mb-2">Source</p>
                    <p className="text-sm text-dark font-medium">{selectedLead.source || 'unknown'}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                  <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                    Payment Information
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-text uppercase font-bold">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mt-1 ${getStatusBadge(selectedLead.payment?.status || 'UNPAID')}`}>
                        {selectedLead.payment?.status || 'UNPAID'}
                      </span>
                    </div>
                  </div>

                  {selectedLead.payment?.transactionId && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Transaction ID</p>
                        <p className="text-sm font-mono text-dark break-all">{selectedLead.payment.transactionId}</p>
                      </div>
                    </div>
                  )}

                  {selectedLead.payment?.amount && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="text-lg font-bold text-primary">₹</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Amount</p>
                        <p className="text-lg font-bold text-dark">₹{selectedLead.payment.amount}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message (from contact forms) */}
                {selectedLead.message && (
                  <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                    <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                      Message
                    </h3>
                    <p className="text-sm text-dark leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
                  </div>
                )}

                {/* Requirements/Quiz Answers */}
                {selectedLead.quizAnswers && Object.keys(selectedLead.quizAnswers).length > 0 && (
                  <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                    <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                      Requirements
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedLead.quizAnswers).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-text uppercase font-bold mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium text-dark">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interested Product */}
                {selectedLead.quizAnswers?.interestedProduct && (
                  <div className="bg-primary/5 rounded-[20px] p-4 border-2 border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Interested Product</p>
                        <p className="text-lg font-bold text-primary uppercase">{selectedLead.quizAnswers.interestedProduct}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleDeleteLead(selectedLead.id, selectedLead.name);
                      closeModal();
                    }}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Lead
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-full bg-gray-200 text-dark hover:bg-gray-300 transition-all duration-300 font-bold text-sm uppercase tracking-wide"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
