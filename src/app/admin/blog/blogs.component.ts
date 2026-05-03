import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost } from '../../models/nutriomedics.models';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class AdminBlogsComponent implements OnInit {
  blogs: BlogPost[] = [];
  loading = false;
  showForm = false;
  isEditing = false;
  deleteConfirmId: number | null = null;
  form: Partial<BlogPost> = this.emptyForm();
  newDocumentUrl = '';
  newDocumentName = '';
  newImageUrl = '';  // For new image URL input
  statusOptions = ['PUBLISHED', 'DRAFT'];

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  private emptyForm(): Partial<BlogPost> {
    return {
      title: '',
      content: '',
      status: 'PUBLISHED',
      documentUrl: null,
      documentName: null,
      imageUrl: null   // Initialize imageUrl as null
    };
  }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAllPosts().subscribe({
      next: (data) => {
        this.blogs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.newDocumentUrl = '';
    this.newDocumentName = '';
    this.newImageUrl = '';
    this.isEditing = false;
    this.showForm = true;
  }

  openEditForm(blog: BlogPost): void {
    this.form = { ...blog };
    this.newDocumentUrl = '';
    this.newDocumentName = '';
    this.newImageUrl = blog.imageUrl || '';
    this.isEditing = true;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.form = this.emptyForm();
    this.newDocumentUrl = '';
    this.newDocumentName = '';
    this.newImageUrl = '';
  }

  // Method to attach image URL
  attachImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (!url) { 
      alert('Please enter an image URL');
      return; 
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Image URL must start with http:// or https://');
      return;
    }
    this.form.imageUrl = url;
    this.newImageUrl = '';  // Clear input
  }

  // Method to remove image
  removeImage(): void {
    this.form.imageUrl = null;
    this.newImageUrl = '';
  }

  attachDocumentUrl(): void {
    const url = this.newDocumentUrl.trim();
    if (!url) { 
      alert('Please enter a document URL'); 
      return; 
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('URL must start with http:// or https://');
      return;
    }
    this.form.documentUrl = url;
    this.form.documentName = this.newDocumentName.trim() || this.extractFilename(url);
    this.newDocumentUrl = '';
    this.newDocumentName = '';
  }

  removeDocument(): void {
    this.form.documentUrl = null;
    this.form.documentName = null;
  }

  downloadDocument(url: string, _name: string): void {
    if (url) window.open(url, '_blank');
  }

  saveBlog(): void {
    if (!this.form.title?.trim() || !this.form.content?.trim()) {
      alert('Please fill in title and content');
      return;
    }

    const payload: Partial<BlogPost> = {
      title: this.form.title.trim(),
      content: this.form.content.trim(),
      status: this.form.status,
      documentUrl: this.form.documentUrl || null,
      documentName: this.form.documentName || null,
      imageUrl: this.form.imageUrl || null
    };

    if (this.isEditing && this.form.id) {
      this.blogService.updatePost(this.form.id, payload).subscribe({
        next: () => { 
          this.loadBlogs(); 
          this.closeForm(); 
          alert('Post updated'); 
        },
        error: (err) => { 
          console.error(err); 
          alert('Update failed'); 
        }
      });
    } else {
      this.blogService.createPost(payload).subscribe({
        next: () => { 
          this.loadBlogs(); 
          this.closeForm(); 
          alert('Post created'); 
        },
        error: (err) => { 
          console.error(err); 
          alert('Creation failed'); 
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  deleteBlog(): void {
    if (!this.deleteConfirmId) return;
    this.blogService.deletePost(this.deleteConfirmId).subscribe({
      next: () => { 
        this.loadBlogs(); 
        this.deleteConfirmId = null; 
        alert('Post deleted'); 
      },
      error: (err) => { 
        console.error(err); 
        alert('Delete failed'); 
      }
    });
  }

  toggleStatus(blog: BlogPost): void {
    const updated = { ...blog, status: blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' };
    this.blogService.updatePost(blog.id, updated).subscribe({
      next: () => this.loadBlogs(),
      error: (err) => { 
        console.error(err); 
        alert('Status update failed'); 
      }
    });
  }

  private extractFilename(url: string): string {
    try {
      const segments = new URL(url).pathname.split('/').filter(Boolean);
      const last = segments.pop();
      return last ? decodeURIComponent(last) : 'Document';
    } catch {
      return 'Document';
    }
  }
}