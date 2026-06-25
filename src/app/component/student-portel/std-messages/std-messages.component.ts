import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'Teacher' | 'Student';
  text: string;
  time: string;
  isRead?: boolean;
}

@Component({
  selector: 'app-std-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './std-messages.component.html',
  styleUrl: './std-messages.component.css'
})
export class StdMessagesComponent implements OnInit {
  teacherName = 'Ustadh Hamza';
  teacherRole = 'Islamic Studies Teacher';
  isOnline = true;

  messages: Message[] = [
    {
      sender: 'Teacher',
      text: 'Assalamualaikum Ali, Please read pages 10–20 from the chapter "The Story of Prophet Yusuf (AS)" before Friday.',
      time: '10:28 AM'
    },
    {
      sender: 'Student',
      text: 'Wa Alaikum Assalam Ustadh, I have completed page 15.',
      time: '10:29 AM',
      isRead: true
    },
    {
      sender: 'Teacher',
      text: 'Excellent! Please continue until page 20 and write down 3 key lessons.',
      time: '10:30 AM'
    },
    {
      sender: 'Student',
      text: 'Sure Ustadh, I will do that. JazakAllah Khair!',
      time: '10:32 AM',
      isRead: true
    },
    {
      sender: 'Teacher',
      text: 'JazakAllah Khair, Ali. Let me know if you need any help.',
      time: '10:33 AM'
    }
  ];

  newMessageText = '';

  ngOnInit(): void {
    // Scroll chat to bottom on load
    setTimeout(() => this.scrollToBottom(), 50);
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;

    this.messages.push({
      sender: 'Student',
      text: this.newMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    });

    const sentMsg = this.messages[this.messages.length - 1];
    this.newMessageText = '';

    setTimeout(() => {
      this.scrollToBottom();
      // Tick animation simulation
      sentMsg.isRead = true;
    }, 100);

    // Simulate small teacher reply
    setTimeout(() => {
      this.messages.push({
        sender: 'Teacher',
        text: 'Barakallahu feek! Keep up the good work.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setTimeout(() => this.scrollToBottom(), 50);
    }, 1500);
  }

  scrollToBottom(): void {
    const chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}
