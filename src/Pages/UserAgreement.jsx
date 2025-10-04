import React from 'react'

const UserAgreement = () => {
  return (
    <div className="mt-20 px-10">
      <div className="prose max-w-none">
        {/* Header */}
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Agreement</h1>
          <p className="text-lg text-gray-600">
             Digital Library Platform - Terms of Service
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            This User Agreement ("Agreement") governs your use of the Digital Library Platform 
            ("Platform"), a service designed specifically for A-Level students in Kawempe, Uganda to 
            access educational materials including books, past papers, and study resources.
          </p>
        </div>

        {/* Terms */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
              Acceptance of Terms
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">
                By registering for and using the Digital Library Platform, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You are currently an A-Level student residing in Kawempe, Uganda</li>
                <li>You have read, understood, and agree to be bound by this Agreement</li>
                <li>You are at least 16 years old or have parental consent to use this platform</li>
                <li>You will provide accurate and complete registration information</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
              Eligibility and Registration
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">
                Access to the Platform is restricted to verified A-Level students in Kawempe, Uganda:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You must provide your full name, school, and valid contact information</li>
                <li>Your school information will be verified for eligibility</li>
                <li>Each student is limited to one account</li>
                <li>Sharing of account credentials is strictly prohibited</li>
                <li>You are responsible for maintaining the confidentiality of your login details</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
              Access and Usage Rights
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">As a registered user, you are granted:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Access to browse the digital library collection</li>
                <li>Ability to borrow up to 3 digital books simultaneously</li>
                <li>Standard loan period of 14 days for borrowed materials</li>
                <li>Access to download past papers and study materials</li>
                <li>Ability to save materials to your personal reading list</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
              User Obligations and Prohibited Activities
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Share, distribute, or reproduce copyrighted materials outside the platform</li>
                <li>Attempt to download the entire library collection</li>
                <li>Use automated scripts or bots to access the platform</li>
                <li>Modify, adapt, or reverse engineer any platform components</li>
                <li>Upload malicious software or attempt to compromise platform security</li>
                <li>Use the platform for commercial purposes</li>
                <li>Share your account with other students or third parties</li>
                <li>Violate any applicable Ugandan copyright laws</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">5</span>
              Intellectual Property and Copyright
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">
                All materials available through the Platform are protected by copyright:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Digital books and past papers are provided for educational use only</li>
                <li>You may not redistribute, sell, or commercially exploit any materials</li>
                <li>Proper attribution must be maintained when referencing materials</li>
                <li>The Platform respects Ugandan copyright laws and international IP rights</li>
                <li>Unauthorized distribution may result in legal action</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">6</span>
              Privacy and Data Protection
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">
                We are committed to protecting your privacy in accordance with Ugandan data protection laws:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>We collect only necessary personal information for service provision</li>
                <li>Your reading history and borrowing patterns are kept confidential</li>
                <li>We do not share your personal data with third parties without consent</li>
                <li>Data is stored securely on servers within Uganda</li>
                <li>You may request deletion of your account and associated data</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">7</span>
              Service Availability and Limitations
            </h2>
            <div className="ml-11 space-y-3">
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Service availability may be affected by internet connectivity in Kawempe</li>
                <li>We aim for 24/7 access but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance may temporarily limit access</li>
                <li>Download limits may apply during peak usage times</li>
                <li>Some materials may have limited simultaneous user access</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">8</span>
              Account Termination and Suspension
            </h2>
            <div className="ml-11 space-y-3">
              <p className="text-gray-700">We reserve the right to suspend or terminate accounts for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violation of this User Agreement</li>
                <li>Sharing account credentials with others</li>
                <li>Unauthorized distribution of copyrighted materials</li>
                <li>Providing false registration information</li>
                <li>Abusive or inappropriate use of the platform</li>
                <li>Failure to return borrowed materials by due dates</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Upon graduation from A-Level, your account will be converted to alumni status with limited access.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">9</span>
              Amendments to Agreement
            </h2>
            <div className="ml-11">
              <p className="text-gray-700">
                We may update this Agreement from time to time. Continued use of the Platform after 
                changes constitutes acceptance of the modified terms. Significant changes will be 
                communicated via email or platform notifications.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">10</span>
              Contact Information
            </h2>
            <div className="ml-11 space-y-2">
              <p className="text-gray-700">
                For questions about this Agreement or to report violations, contact:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <p className="text-gray-700 font-semibold">Kawempe Digital Library Administration</p>
                <p className="text-gray-600">Email: admin@kawempedigitallibrary.ac.ug</p>
                <p className="text-gray-600">Phone: +256 XXX XXX XXX</p>
                <p className="text-gray-600">Address: Kawempe Education District Office</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Acknowledgement</h3>
            <p className="text-blue-800 text-sm">
              By using the Kawempe Digital Library Platform, you acknowledge that you have read, 
              understood, and agree to be bound by all terms and conditions outlined in this 
              User Agreement. This platform is made possible through the support of the 
              Kawempe Education District and partner organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAgreement