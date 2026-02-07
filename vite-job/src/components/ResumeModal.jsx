import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function ResumeModal({ show, onHide, url, filename }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Resume Preview {filename ? `- ${filename}` : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 400 }}>
        {url ? (
          <iframe src={url} title="resume-preview" style={{ width: '100%', height: '70vh', border: 'none' }} />
        ) : (
          <div className="text-center text-muted">No resume available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
