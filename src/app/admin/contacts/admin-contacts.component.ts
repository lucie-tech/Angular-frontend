import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactMessage } from '../../core/services/contact.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-contacts.component.html',
  styleUrls: ['./admin-contacts.component.scss']
})
export class AdminContactsComponent implements OnInit {
  messages: ContactMessage[] = [];
  loading = false;
  showReplyModal = false;
  selectedMessage: ContactMessage | null = null;
  replyText = '';
  deleteConfirmId: number | null = null;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.contactService.getAllMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openReplyModal(message: ContactMessage): void {
    this.selectedMessage = message;
    this.replyText = '';
    this.showReplyModal = true;
  }

  closeReplyModal(): void {
    this.showReplyModal = false;
    this.selectedMessage = null;
    this.replyText = '';
  }

  sendReply(): void {
    if (!this.selectedMessage || !this.replyText.trim()) {
      alert('Reply message cannot be empty.');
      return;
    }
    this.contactService.replyToMessage(this.selectedMessage.id, this.replyText).subscribe({
      next: () => {
        this.contactService.clearCache();
        this.loadMessages();
        this.closeReplyModal();
        alert('Reply sent successfully.');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send reply.');
      }
    });
  }

  markAsRead(message: ContactMessage): void {
    if (message.status === 'READ' || message.status === 'REPLIED') return;
    this.contactService.markAsRead(message.id).subscribe({
      next: () => {
        this.contactService.clearCache();
        this.loadMessages();
      },
      error: (err) => console.error(err)
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteMessage(): void {
    if (!this.deleteConfirmId) return;
    this.contactService.deleteMessage(this.deleteConfirmId).subscribe({
      next: () => {
        this.contactService.clearCache();
        this.loadMessages();
        this.deleteConfirmId = null;
        alert('Message deleted successfully.');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete message.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'UNREAD': return 'status-unread';
      case 'READ':   return 'status-read';
      case 'REPLIED':return 'status-replied';
      default: return '';
    }
  }
}