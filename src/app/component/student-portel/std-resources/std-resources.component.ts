import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ResourceItem {
  id: number;
  title: string;
  description: string;
  category: 'Mathematics' | 'Reading' | 'Science';
  logoClass: string;
  logoColor: string;
  logoBg: string;
  url: string;
  suitableFor: string;
  learningAreas: string[];
  features: string[];
  imageUrl: string;
}

@Component({
  selector: 'app-std-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './std-resources.component.html',
  styleUrl: './std-resources.component.css'
})
export class StdResourcesComponent implements OnInit {
  @Output() resourceSelected = new EventEmitter<ResourceItem>();

  resources: ResourceItem[] = [
    // Mathematics
    {
      id: 1,
      title: 'Khan Academy',
      description: 'Free practice exercises and lessons for math learners.',
      category: 'Mathematics',
      logoClass: 'fa-solid fa-graduation-cap',
      logoColor: '#10B981',
      logoBg: '#E6F9F1',
      url: 'https://www.khanacademy.org',
      suitableFor: 'Grade 1 – Grade 6',
      learningAreas: ['Mathematics', 'Arithmetic', 'Pre-Algebra'],
      features: ['Interactive Exercises', 'Instructional Videos', 'Personalized Dashboard'],
      imageUrl: 'assets/img/book_1.png'
    },
    {
      id: 2,
      title: 'Prodigy',
      description: 'Game-based learning that makes math exciting.',
      category: 'Mathematics',
      logoClass: 'fa-solid fa-gamepad',
      logoColor: '#F59E0B',
      logoBg: '#FEF3C7',
      url: 'https://www.prodigygame.com',
      suitableFor: 'Grade 1 – Grade 5',
      learningAreas: ['Mathematics', 'Problem Solving'],
      features: ['Game-Based Quests', 'Rewards System', 'Parent/Teacher Reporting'],
      imageUrl: 'assets/img/book_2.png'
    },
    {
      id: 3,
      title: 'IXL Learning',
      description: 'Comprehensive math practice aligned with school curriculum.',
      category: 'Mathematics',
      logoClass: 'fa-solid fa-bolt',
      logoColor: '#3B82F6',
      logoBg: '#EBF5FF',
      url: 'https://www.ixl.com',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Mathematics', 'Geometry', 'Logic'],
      features: ['Unlimited Practice Problems', 'Real-Time Diagnostics', 'Certificates of Achievement'],
      imageUrl: 'assets/img/book_3.png'
    },
    {
      id: 4,
      title: 'Coolmath4Kids',
      description: 'Fun math games and activities for kids of all ages.',
      category: 'Mathematics',
      logoClass: 'fa-solid fa-face-smile',
      logoColor: '#EC4899',
      logoBg: '#FCE7F3',
      url: 'https://www.coolmath4kids.com',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Mathematics', 'Basic Operations'],
      features: ['Fun Mini-Games', 'Interactive Brain Teasers', 'Lesson Tutorials'],
      imageUrl: 'assets/img/book_4.png'
    },
    // Reading
    {
      id: 5,
      title: 'Sadlier Connect',
      description: 'Engaging books and comprehension practice for young learners.',
      category: 'Reading',
      logoClass: 'fa-solid fa-book-open-reader',
      logoColor: '#EF4444',
      logoBg: '#FEE2E2',
      url: 'https://www.sadlierconnect.com',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Reading Comprehension', 'Vocabulary'],
      features: ['Digital Textbooks', 'Online Assessments', 'Grammar Activities'],
      imageUrl: 'assets/img/book_5.png'
    },
    {
      id: 6,
      title: 'Khan Academy Kids',
      description: 'Interactive learning activities, books, and games for children.',
      category: 'Reading',
      logoClass: 'fa-solid fa-child',
      logoColor: '#10B981',
      logoBg: '#E6F9F1',
      url: 'https://khankids.org',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Reading', 'Vocabulary', 'Mathematics', 'Critical Thinking'],
      features: ['Interactive Lessons', 'Educational Videos', 'Reading Practice', 'Progress Tracking'],
      imageUrl: 'assets/img/book_1.png'
    },
    {
      id: 7,
      title: 'Starfall',
      description: 'Learn to read with phonics, songs, and educational games.',
      category: 'Reading',
      logoClass: 'fa-solid fa-star',
      logoColor: '#F59E0B',
      logoBg: '#FEF3C7',
      url: 'https://www.starfall.com',
      suitableFor: 'Grade 1 – Grade 3',
      learningAreas: ['Phonics', 'Early Reading', 'Spelling'],
      features: ['Interactive Stories', 'Sing-Along Songs', 'Phonics Worksheets'],
      imageUrl: 'assets/img/book_2.png'
    },
    {
      id: 8,
      title: 'Oxford Owl',
      description: 'Free eBooks and teaching resources for children.',
      category: 'Reading',
      logoClass: 'fa-solid fa-feather-pointed',
      logoColor: '#8B5CF6',
      logoBg: '#EDE9FE',
      url: 'https://www.oxfordowl.co.uk',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Reading Comprehension', 'Phonics', 'Writing'],
      features: ['Free eBook Library', 'Vocabulary Builders', 'Parent Advice Guides'],
      imageUrl: 'assets/img/book_3.png'
    },
    {
      id: 9,
      title: 'Epic!',
      description: 'Thousands of books and audiobooks for kids.',
      category: 'Reading',
      logoClass: 'fa-solid fa-book-bookmark',
      logoColor: '#06B6D4',
      logoBg: '#ECFEFF',
      url: 'https://www.getepic.com',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Reading', 'Listening Comprehension'],
      features: ['Unlimited Reading Access', 'Audio Books Narrated', 'Interactive Quizzes'],
      imageUrl: 'assets/img/book_4.png'
    },
    {
      id: 10,
      title: 'Duolingo ABC',
      description: 'Fun, bite-sized lessons to build reading skills.',
      category: 'Reading',
      logoClass: 'fa-solid fa-check-double',
      logoColor: '#10B981',
      logoBg: '#E6F9F1',
      url: 'https://www.duolingo.com/abc',
      suitableFor: 'Grade 1 – Grade 2',
      learningAreas: ['Phonics', 'Handwriting', 'Sight Words'],
      features: ['Gamified Reading Steps', 'Cute Animal Characters', 'Bite-Sized Lessons'],
      imageUrl: 'assets/img/book_5.png'
    },
    // Science
    {
      id: 11,
      title: 'National Geographic Kids',
      description: 'Explore the world through videos, games, & fun facts.',
      category: 'Science',
      logoClass: 'fa-solid fa-earth-americas',
      logoColor: '#F59E0B',
      logoBg: '#FEF3C7',
      url: 'https://kids.nationalgeographic.com',
      suitableFor: 'Grade 1 – Grade 6',
      learningAreas: ['Science', 'Geography', 'Animal Studies'],
      features: ['Nature Video Logs', 'Educational Quiz Games', 'Interactive Science Articles'],
      imageUrl: 'assets/img/book_1.png'
    },
    {
      id: 12,
      title: 'NASA Climate Kids',
      description: 'Learn about the Earth\'s climate through games and activities.',
      category: 'Science',
      logoClass: 'fa-solid fa-rocket',
      logoColor: '#3B82F6',
      logoBg: '#EBF5FF',
      url: 'https://climatekids.nasa.gov',
      suitableFor: 'Grade 1 – Grade 4',
      learningAreas: ['Science', 'Climatology', 'Astronomy'],
      features: ['Weather Simulators', 'Fun Space Missions', 'Science Handcrafts'],
      imageUrl: 'assets/img/book_2.png'
    },
    {
      id: 13,
      title: 'Mystery Science',
      description: 'Science lessons that spark curiosity and wonder.',
      category: 'Science',
      logoClass: 'fa-solid fa-magnifying-glass',
      logoColor: '#8B5CF6',
      logoBg: '#EDE9FE',
      url: 'https://mysteryscience.com',
      suitableFor: 'Grade 1 – Grade 5',
      learningAreas: ['Science', 'Critical Thinking', 'Biology'],
      features: ['Curiosity Workouts', 'Hands-On Experiments', 'Short Video Lessons'],
      imageUrl: 'assets/img/book_3.png'
    }
  ];

  selectedFilter: 'All' | 'Reading' | 'Mathematics' | 'Science' = 'All';
  activeResourceId = 6; // Default active (Khan Academy Kids)

  ngOnInit(): void {
    // Select default resource on load
    const defaultRes = this.resources.find(r => r.id === this.activeResourceId);
    if (defaultRes) {
      setTimeout(() => this.resourceSelected.emit(defaultRes), 50);
    }
  }

  setFilter(filter: 'All' | 'Reading' | 'Mathematics' | 'Science'): void {
    this.selectedFilter = filter;
  }

  filteredResources(): ResourceItem[] {
    if (this.selectedFilter === 'All') {
      return this.resources;
    }
    return this.resources.filter(r => r.category === this.selectedFilter);
  }

  selectResource(resource: ResourceItem): void {
    this.activeResourceId = resource.id;
    this.resourceSelected.emit(resource);
  }
}
