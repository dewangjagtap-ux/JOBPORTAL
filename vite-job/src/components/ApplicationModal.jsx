import React from 'react'
import { Modal, Button } from 'react-bootstrap'

// Shows application confirmation and simulated email content
export default function ApplicationModal({ show, onHide, email }) {
  if (!email) return null
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Application Submitted</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Your application has been submitted successfully.</p>
        <hr />
        <h6>Email preview</h6>
        <div><strong>To:</strong> {email.to}</div>
        <div><strong>Subject:</strong> {email.subject}</div>
        <div className="mt-2">{email.message}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
