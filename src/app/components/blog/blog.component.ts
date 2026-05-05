import { Component, OnInit, OnDestroy, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, firstValueFrom } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BlogService } from '../../core/services/blog.service';
import { FAQService } from '../../core/services/faq.service';
import { BlogPost, FAQ as FAQModel } from '../../models/nutriomedics.models';

interface FAQ extends FAQModel {
  active: boolean;
}

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeUrlPipe],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {
  posts: BlogPost[] = [];
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  // Dynamic FAQs from backend
  faqs: FAQ[] = [];
  isLoadingFaqs = false;
  faqErrorMessage = '';

  selectedPost: BlogPost | null = null;
  showDocumentModal = false;
  pdfUrl: string | null = null;

  // Read more state
  expandedPosts = new Set<string>();

  constructor(
    private blogService: BlogService,
    private faqService: FAQService,
    private cdr: ChangeDetectorRef
  ) {}

  // Computed properties for post separation
  get postsWithImages(): BlogPost[] {
    return this.posts.filter(post => post.imageUrl && post.imageUrl.trim());
  }

  get postsWithoutImages(): BlogPost[] {
    return this.posts.filter(post => !post.imageUrl || !post.imageUrl.trim());
  }

  ngOnInit(): void {
    this.loadPosts();
    this.loadFAQs();
  }

  async loadPosts(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const data = await firstValueFrom(this.blogService.getPosts().pipe(take(1)));
      this.posts = data.filter(post => post.status === 'PUBLISHED');
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to load blog posts';
      console.error(err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadFAQs(): Promise<void> {
    this.isLoadingFaqs = true;
    this.faqErrorMessage = '';
    this.cdr.detectChanges();

    try {
      const data = await firstValueFrom(this.faqService.getActiveFAQs().pipe(take(1)));
      this.faqs = data.map(faq => ({
        ...faq,
        active: false
      }));
    } catch (err: any) {
      this.faqErrorMessage = err.message || 'Failed to load FAQs';
      console.error(err);
    } finally {
      this.isLoadingFaqs = false;
      this.cdr.detectChanges();
    }
  }

  hasValidDocument(post: BlogPost): boolean {
    return this.blogService.hasValidDocument(post);
  }

  getDocumentUrl(post: BlogPost | null): string {
    return this.blogService.getDocumentUrl(post);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return ''; }
  }

  openDocument(post: BlogPost): void {
    if (!this.hasValidDocument(post)) return;
    this.selectedPost = post;
    this.pdfUrl = this.blogService.toEmbeddableUrl(this.getDocumentUrl(post));
    this.showDocumentModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedPost = null;
    this.pdfUrl = null;
    document.body.style.overflow = '';
  }

  downloadDocument(post: BlogPost): void {
    if (!this.hasValidDocument(post)) return;
    window.open(this.getDocumentUrl(post), '_blank');
  }

  toggleFaq(index: number): void {
    this.faqs[index].active = !this.faqs[index].active;
  }

  // Read more methods
  isPostExpanded(postId: string): boolean {
    return this.expandedPosts.has(postId);
  }

  toggleReadMore(postId: string): void {
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
    } else {
      this.expandedPosts.add(postId);
    }
    this.cdr.detectChanges();
  }

  getTruncatedContent(content: string): string {
    const maxLength = 500; // Adjust this value as needed
    if (!content) return '';
    if (content.length <= maxLength) return content;
    // Find a natural break (space) near the limit
    let truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substring(0, lastSpace);
    }
    return truncated + '...';
  }

  needsTruncation(content: string): boolean {
    if (!content) return false;
    return content.length > 500; // Must match maxLength above
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = '';
  }
}