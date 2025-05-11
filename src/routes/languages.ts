import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// GET /api/languages - Returns available languages
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // You could load this from a database or separate JSON files
    // For now, using hardcoded language data
    const response: Record<string, Record<string, string | Record<string, any>>> = {
      'en': {
        "app_name": "Drops",
        "login": "Login",
        "register": "Register",
        "email": "Email",
        "password": "Password",
        "forgot_password": "Forgot password?",
        "sign_in": "Sign In",
        "sign_up": "Sign Up",
        "welcome": "Welcome",
        "home": "Home",
        "profile": "Profile",
        "settings": "Settings",
        "notifications": "Notifications",
        "drops": "Drops",
        "create": "Create",
        "explore": "Explore",
        "friends": "Friends",
        "messages": "Messages",
        "search": "Search",
        "loading": "Loading...",
        "error_occurred": "An error occurred",
        "try_again": "Try Again",
        "cancel": "Cancel",
        "confirm": "Confirm",
        "delete": "Delete",
        "edit": "Edit",
        "save": "Save",
        "no_items": "No items found",
        "send": "Send",
        "invite_friends": "Invite Friends",
        "location_services": "Location Services",
        "enable_location": "Please enable location services.",
        "location_permission": "Location Permission",
        "location_denied": "Location permission has been denied. Please enable it in settings.",
        "settings_button": "Settings",
        "select_country": "Select a Country",
        "no_notifications": "You have no notifications yet.",
        "mark_all_read": "Mark all as read",
        "clear_all": "Clear all",
        "phone_number": "Phone Number",
        "country_code": "Country Code",
        "terms_conditions": "Terms and Conditions",
        "privacy_policy": "Privacy Policy",
        "agree_terms": "I agree to the",
        "and": "and",
        "language": "Language",
        "language_settings": "Language Settings",
        "choose_language": "Choose your language",
        "change_language": "Change app language",
        "digital_drop": "Digital Drop",
        "postal_drop": "Postal Drop",
        "recipient": "Recipient",
        "sender": "Sender",
        "shipping": "Shipping",
        "payment": "Payment",
        "total": "Total",
        "order_summary": "Order Summary",
        "continue": "Continue",
        "back": "Back",
        "next": "Next",
        "skip": "Skip",
        "friend_drops": "Friend Drops",
        "create_drop": "Create Drop",
        "user_blocked": "User blocked",
        "user_unblocked": "User unblocked",
        "block_user": "Block User",
        "unblock_user": "Unblock User",
        "report_user": "Report User",
        "add_friend": "Add Friend",
        "remove_friend": "Remove Friend",
        "friend_request_sent": "Friend request sent",
        "accept_request": "Accept Request",
        "decline_request": "Decline Request",
        "view_profile": "View Profile",
        "gallery": "Gallery",
        "take_photo": "Take Photo",
        "record_video": "Record Video",
        "typing": "typing...",
        "online": "Online",
        "offline": "Offline",
        "last_seen": "Last seen",
        "today": "Today",
        "yesterday": "Yesterday",
        "video_call": "Video Call",
        "audio_call": "Audio Call",
        "recently": "Recently",
        "new_message": "New message",
        "log_out": "Log Out",
        "delete_account": "Delete Account",
        "account_settings": "Account Settings",
        "notification_settings": "Notification Settings",
        "change_password": "Change Password",
        "about": "About",
        "help": "Help",
        "feedback": "Feedback",
        "rate_app": "Rate App",
        "share_app": "Share App",
        "dark_theme": "Dark Theme",
        "light_theme": "Light Theme",
        "system_theme": "System Theme",
        "theme": "Theme",
        "distance": "Distance",
        "away": "away",
        "nearby": "Nearby",
        "my_location": "My Location",
        "search_location": "Search Location",
        "preview": "Preview",
        "apply": "Apply",
        "discard": "Discard",
        "created": "Created",
        "expires_in": "Expires in",
        "not_found": "Not Found",
        "empty_list": "Nothing to display",
        "reset": "Reset",
        "camera_permission": "We need camera access to take photos",
        "storage_permission": "We need storage access to save photos",
        "location_access": "We need location access to show drops nearby",
      
      
        "profile_updated_successfully": "Profile updated successfully",
        "error_updating_profile": "Error updating profile",
        "photo_library": "Photo Library",
        "remove_profile_picture": "Remove Profile Picture",
        "profile_picture": "Profile Picture",
        "update_profile": "Update Profile",
        "update_successful": "Update successful",
        "update_failed": "Update failed",
        "update_profile_picture": "Update Profile Picture",
        "retake": "Retake",
        "gallery_access_error": "Error accessing gallery",
        "video_recording_completed": "Video recording completed",
        "video_saved_success": "Video saved successfully!",
        "image_saved_success": "Image saved successfully!",
        "deleted_message": "This message was deleted",
        "drop_type_selection": {
          "title": "Create a Drop",
          "find_friends": "Find Friends",
      
          "subtitle": "Select how you want to share your memories.",
          "digital_drop": {
            "title": "Digital Drop",
            "description": "Share your moments instantly."
          },
          "postal_drop": {
            "title": "Post Drop",
            "description": "Send your memories by postcard."
          }
        },
        "accessibility": {
          "friend_selector": "Open friends list",
          "navigate_forward": "Continue"
        },
        "digital_drop_creation": {
          "title": "Create Digital Drop",
          "select_location": "Select a location",
          "send_drop": "Send Drop",
          "errors": {
            "microphone_permission": "Microphone permission required",
            "music_feature": "Music feature coming soon!",
            "stop_recording": "Please stop audio recording first",
            "add_media": "Please add media",
            "select_friend": "Please select at least one friend"
          },
          "accessibility": {
            "image": "Select image from gallery",
            "camera": "Take photo or video",
            "audio": "Record audio",
            "music": "Select music",
            "expand_map": "Expand map",
            "shrink_map": "Shrink map"
          }
        },
       
        "chat": {
        "default_title": "Chat",
        "loading": "Loading...",
        "load_error": "Failed to load messages: {error}",
        "send_error": "Failed to send message: {error}",
        "send_image_error": "Failed to send image: {error}",
        "send_file_error": "Failed to send file: {error}",
        "download_error": "Error downloading file: {error}",
        "image_load_error": "Could not load image",
        "delete_title": "Delete Message",
        "delete_confirmation": "Are you sure you want to delete this message?",
        "cancel": "Cancel",
        "delete": "Delete",
        "media_picker": {
          "photo": "Photo",
          "file": "File",
          "cancel": "Cancel"
        },
        "uploading": "Uploading attachment...",
        "custom_message": {
          "view_drop": "View Drop",
          "locked": "Locked",
          "unlocked": "Unlocked"
        }
      },
      "conversation_info": {
        "title": "Conversation Info",
        "group_chat": "Group Chat",
        "members_count": "{count} members",
        "members_section": "MEMBERS",
        "admin_role": "Admin",
        "you": "You",
        "shared_media": {
          "title": "Shared Media",
          "coming_soon": "Shared Media coming soon"
        },
        "edit_group": {
          "title": "Edit Group Name",
          "coming_soon": "Edit Group Name coming soon"
        },
        "leave": {
          "button": "Leave Conversation",
          "dialog_title": "Leave Conversation?",
          "dialog_message": "Are you sure you want to leave this conversation? You won't receive any new messages.",
          "confirm": "LEAVE",
          "cancel": "CANCEL",
          "success": "You left the conversation",
          "failure": "Failed to leave conversation: {error}"
        }
      },
      "conversations_list": {
        "title": "Messages",
        "tooltips": {
          "refresh": "Refresh conversations",
          "search": "Search conversations"
        },
        "notifications": {
          "search_coming_soon": "Search coming soon",
          "conversation_deleted": "Conversation deleted",
          "error_loading": "Error loading conversations: {error}"
        },
        "empty_state": {
          "no_conversations": "No conversations yet",
          "start_message": "Start messaging with your friends",
          "start_button": "Start a conversation"
        },
        "error_state": {
          "title": "Could not load conversations",
          "message": "Pull down to refresh or try again later",
          "button": "Try Again"
        }
      },
      "new_conversation": {
        "title": "Nouvelle Conversation",
        "search_friends": "Rechercher des Amis",
        "search_placeholder": "Entrez un nom",
        "group_name": "Nom du Groupe (Optionnel)",
        "group_name_placeholder": "Entrez un nom pour votre groupe",
        "empty_search": "Aucun ami ne correspond à votre recherche",
        "no_friends": "Pas encore d'amis",
        "select_friend": "Veuillez sélectionner au moins un ami",
        "create_error": "Échec de création de la conversation",
        "error_loading": "Erreur lors du chargement des amis : {error}",
        "try_again": "Réessayer",
        "tooltips": {
          "group_chat": "Discussion de Groupe",
          "direct_message": "Message Direct",
          "clear_search": "Effacer la recherche",
          "create_conversation": "Créer une conversation"
        }
      },
      "conversation_list_item": {
        "group_chat": "Group Chat",
        "yesterday": "Yesterday",
        "no_messages": "No messages yet",
        "you": "You: "
      },
      "typing_indicator": {
        "single_user": "{user} is typing",
        "two_users": "{user1} and {user2} are typing",
        "multiple_users": "Several people are typing"
      },
      "friend_selection": {
        "select_friend": "Select {name}",
        "deselect_friend": "Deselect {name}",
        "online_status": "Online",
        "profile_image": "{name}'s profile picture"
      },"user_avatar": {
        "accessibility_label": "{name}'s profile picture",
        "error_loading": "Error loading profile picture for {name}"
      },"camera": {
        "gallery": "Gallery",
        "gallery_access_error": "Gallery access error",
        "video_recording_completed": "Video recording completed",
        "retake": "Retake",
        "confirm": "Confirm",
        "tooltips": {
          "switch_camera": "Switch camera",
          "take_photo": "Take photo",
          "start_recording": "Start recording",
          "stop_recording": "Stop recording",
          "open_gallery": "Open gallery"
        },
        "accessibility": {
          "camera_preview": "Camera preview",
          "image_preview": "Image preview",
          "video_preview": "Video preview",
          "play_video": "Play video",
          "pause_video": "Pause video"
        }
      },
      "drop_sending": {
        "title": "Send Drop",
        "sending": "Sending your drop...",
        "success": "Drop Sent!",
        "success_description": "Your drop has been sent to your friends.",
        "error": "Sending Failed",
        "error_description": "There was an error sending your drop. Please try again.",
        "done": "Done",
        "retry": "Retry",
        "success_title": "Drop sent successfully!",
        "continue_button": "Continue",
        "error_title": "Failed to send drop",
        "retry_button": "Retry",
        "error_message": "Error: {error}",
        "accessibility": {
          "loading": "Drop sending in progress",
          "back": "Return to home screen",
           "success_animation": "Success animation showing a dropped pin",
          "error_icon": "Error icon"
      }
      },
      "friend_selector": {
        "title": "Select Friends",
        "search_placeholder": "Search friends",
        "no_friends": "No friends found",
        "selected_count": "{count} selected",
        "done_button": "Done",
        "cancel_button": "Cancel",
        "send_button": "Send",
        "continue_button": "Continue"
      },
      "image_edit": {
        "title": "Edit Image",
        "error_opening_editor": "Error opening editor: {error}",
        "tooltips": {
          "repick_image": "Choose different image",
          "edit_image": "Edit image",
          "confirm_image": "Confirm image"
        },
        "accessibility": {
          "image_preview": "Image preview",
          "edit_buttons": "Image editing options"
        }
      },
      "sending_animation": {
        "title": "Sending Your Drop...",
        "accessibility": {
          "loading": "Drop sending in progress"
        }
      },
      "drop_detail": {
        "title": "Drop Details",
        "not_found": "Drop Not Found",
        "error_loading": "Error loading drop",
        "try_again": "Try Again",
        "drop_not_found_message": "The requested drop could not be found",
        "drop_by": "Drop by {name}",
        "get_nearby": "Get nearby to unlock",
        "distance": {
          "meters_away": "{distance} meters away",
          "km_away": "{distance} km away"
        },
        "time_ago": {
          "just_now": "just now",
          "minute_ago": "{count} minute ago",
          "minutes_ago": "{count} minutes ago",
          "hour_ago": "{count} hour ago",
          "hours_ago": "{count} hours ago",
          "day_ago": "{count} day ago",
          "days_ago": "{count} days ago"
        },
        "shared": {
          "title": "Shared with",
          "empty": "This drop has not been shared with anyone.",
          "shared_ago": "Shared {time_ago}"
        },
        "posted_ago": "Posted {time_ago}",
        "navigate_button": "Navigate to Drop",
        "tooltips": {
          "refresh_location": "Refresh location",
          "shared_users": "View shared users"
        },
        "maps": {
          "error": "Could not open maps application",
          "no_location": "No location information available"
        },
        "close": "Close"
      },
      "drops_overview": {
        "title": "My Drops",
        "loading": "Loading drops...",
        "error": "Error loading drops",
        "categories": {
          "my_drops": "My Drops",
          "shared_with_me": "Shared With Me",
          "explore_nearby": "Explore Nearby"
        },
        "empty_state": {
          "title": "No drops yet",
          "message": "Create your first drop to get started",
          "button": "Create Drop"
        },
        "refresh": "Pull down to refresh"
      },
      "explore_drops": {
        "title": "Explore Drops",
        "tabs": {
          "explore": "Explore",
          "my_drops": "My Drops"
        },
        "tooltips": {
          "switch_to_satellite": "Switch to satellite view",
          "switch_to_map": "Switch to map view",
          "refresh": "Refresh drops",
          "my_location": "Go to my location"
        },
        "errors": {
          "loading_drops": "Error loading nearby drops: {error}",
          "location_access": "Could not access your location",
          "refresh_failed": "Error refreshing drops",
          "location_permission_denied": "Could not access your location. Please check your permissions."
        },
        "loading": {
          "initializing_map": "Initializing map...",
          "loading_drops": "Loading drops...",
          "processing_drops": "Processing {current} of {total} drops"
        },
        "empty_state": {
          "no_drops": "No drops found nearby. Move the map to discover more or try again later.",
          "no_my_drops": "You have no drops yet."
        },
        "location_permission": {
          "title": "Location Access Required",
          "enable_button": "Enable Location Access"
        }
      },"friends_drops": {
        "title": "Shared With Me",
        "error_loading": "Error loading shared drops",
        "empty_state": {
          "title": "No shared drops",
          "message": "When friends share drops with you, they will appear here."
        }
      },
      "my_drops": {
        "title": "My Drops",
        "filter": {
          "button_tooltip": "Filter drops",
          "all": "All Drops",
          "today": "Today",
          "this_week": "This Week",
          "this_month": "This Month",
          "older": "Older",
          "filter": {
          "title": "Filter Drops",
          "all": "All Drops",
          "all_description": "Show all your drops",
          "digital": "Digital Drops",
          "digital_description": "Only digital drops",
          "postal": "Postal Drops",
          "postal_description": "Only postal drops",
          "recent": "Newest First",
          "recent_description": "Sort by newest",
          "oldest": "Oldest First",
          "oldest_description": "Sort by oldest"
        }
        },
        "loading": "Loading your drops...",
        "error_loading": "Error loading drops",
        "empty_state": {
          "title": "No drops yet",
          "message": "Create your first drop to get started",
          "button": "Create Drop"
        },
        "no_filtered_results": "No drops match your current filter"
      },
      "drop_card": {
        "locked": "Get closer to unlock",
        "navigate": "Navigate",
        "created": "Created {date}",
        "shared_by": "Shared by {name}",
        "distance": {
          "kilometers": "{distance} km",
          "meters": "{distance} m"
        },
        "errors": {
          "invalid_location": "Invalid location coordinates",
          "maps_open_error": "Could not open maps",
          "general_error": "Error: {error}"
        },
        "media": {
          "audio": "Audio Recording",
          "accessibility": {
            "locked_content": "Locked content, get closer to unlock",
            "play_audio": "Play audio recording"
          }
        }
      },
      "drop_type_indicator": {
        "digital": "Digital",
        "postal": "Postal",
        "accessibility": {
          "digital": "Digital drop",
          "postal": "Postal drop"
        }
      },
      "locked_fullscreen_image": {
        "navigation": {
          "title": "Navigation to Drop",
          "location_unavailable": "Location coordinates not available",
          "could_not_open_maps": "Could not open maps",
          "error_opening_maps": "Error opening maps: {error}"
        },
        "unlock": {
          "success": "Content unlocked successfully!",
          "unlocking": "Unlocking...",
          "unlock_now": "Unlock Now",
          "tap_unlock": "Tap the unlock button to view this content",
          "get_closer": "Get closer to unlock this content",
          "distance_away": "You are {distance}km away",
          "distance_required": "You need to be within {unlockDistance}km to unlock. Current distance: {currentDistance}km",
          "navigate": "Navigate",
          "failed": "Failed to load image"
        },
        "accessibility": {
          "go_back": "Go back",
          "unlock_content": "Unlock content",
          "unlock_button": "Button to unlock content",
          "navigation_button": "Navigate to drop location"
        }
      },"my_drops_tab_bar": {
        "all": "All",
        "my_drops": "My Drops",
        "shared": "Shared",
        "accessibility": {
          "tab_selector": "Select tab: {tab_name}"
        }
      },"navigation_map_screen": {
        "title": "Navigation",
        "errors": {
          "location_services_disabled": "Location services are disabled",
          "location_permission_denied": "Location permissions are denied",
          "permanent_permission_denied": "Location permissions are permanently denied",
          "initializing_location": "Error initializing location: {error}",
          "tracking_location": "Error tracking location: {error}",
          "updating_map": "Error updating map: {error}",
          "zooming": "Error zooming to current location: {error}"
        },
        "markers": {
          "drop": {
            "title": "Your Drop",
            "snippet": "Destination"
          },
          "current_location": {
            "title": "Your Location",
            "distance_away": "{distance} km away",
            "snippet": "Current location"
          }
        },
        "distance_indicator": "Distance: {distance} km",
        "tooltips": {
          "center_map": "Center map to show both points",
          "zoom_location": "Zoom to your location",
          "back": "Go back"
        }
      },"app_qr_code": {
        "title": "Invite Friends",
        "scan_title": "Scan to download the app",
        "app_store": "App Store",
        "google_play": "Google Play",
        "copy_link": "Copy Link",
        "share": "Share",
        "link_copied": "Link copied to clipboard",
        "accessibility": {
          "qr_code": "QR code to download the app",
          "app_store_qr": "QR code for App Store download",
          "google_play_qr": "QR code for Google Play download"
        }
      },"blocked_users": {
        "title": "Blocked Users",
        "empty_state": {
          "title": "No blocked users",
          "message": "When you block someone, they will appear here"
        },
        "error": {
          "loading": "Error loading blocked users: {error}",
          "retry": "Retry"
        },
        "loading": "Loading blocked users..."
      },"contact_invitation": {
        "title": "Invite Contacts",
        "search_placeholder": "Search contacts",
        "permission": {
          "title": "Permission Required",
          "message": {
            "ios": "To invite your contacts, we need permission to access your contacts.",
            "android": "To invite your contacts, we need permission to access your contacts."
          },
          "settings_message": {
            "ios": "To invite your contacts, enable contacts access in Settings > Privacy > Contacts > Drops App.",
            "android": "To invite your contacts, we need permission to access your contacts."
          },
          "denied_title": "Contacts Permission Required",
          "denied_message": "To invite your contacts, we need permission to access your contacts list.",
          "steps": {
            "ios": [
              "1. Tap \"Open Settings\" below",
              "2. Select \"Privacy & Security\"",
              "3. Tap \"Contacts\"",
              "4. Find \"Drops App\" in the list",
              "5. Toggle the switch to ON",
              "6. Return to the app and tap \"Try Again\""
            ]
          }
        },
        "buttons": {
          "open_settings": "Open Settings",
          "try_again": "Try Again",
          "later": "Later",
          "cancel": "CANCEL",
          "invite": "Invite",
          "retry": "Retry"
        },
        "empty_state": {
          "title": "No contacts found",
          "message": ""
        },
        "errors": {
          "access": "Error accessing contacts: {error}",
          "loading": "Error loading contacts: {error}",
          "invitation": "Error: {error}",
          "settings": "Could not open settings automatically",
          "send": "Could not send invitation"
        },
        "success": "Invitation sent to {name}"
      },"no_phone": "No Phone",
      "friend_profile": {
        "title": "Friend Profile",
        "online": "Online",
        "offline": "Offline",
        "last_seen": "Last seen {time}",
        "just_now": "just now",
        "minute_ago": "{count} minute ago",
        "minutes_ago": "{count} minutes ago",
        "hour_ago": "{count} hour ago",
        "hours_ago": "{count} hours ago",
        "day_ago": "{count} day ago",
        "days_ago": "{count} days ago",
        "actions": {
          "message": "Message",
          "video_call": "Video Call",
          "video_call_coming_soon": "Video call feature coming soon!"
        },
        "menu": {
          "block": "Block",
          "remove": "Remove Friend"
        },
        "confirmation": {
          "block_title": "Block {name}?",
          "block_message": "This user won't be able to see your profile or send you messages anymore.",
          "block_button": "Block",
          "remove_title": "Remove {name}?",
          "remove_message": "This person will be removed from your friends list.",
          "remove_button": "Remove",
          "cancel": "Cancel"
        },
        "notifications": {
          "user_blocked": "{name} has been blocked",
          "user_removed": "{name} has been removed from your friends"
        },
        "mutual_friends": {
          "title": "Mutual Friends",
          "empty": "No mutual friends yet",
          "error": "Failed to load mutual friends: {error}"
        }
      },
      "friend_requests": {
        "title": "Friend Requests",
        "empty_state": {
          "title": "No friend requests",
          "message": "When someone sends you a friend request, it will appear here"
        },
        "error_loading": "Error loading requests: {error}",
        "try_again": "Try Again",
        "loading": "Loading friend requests...",
        "buttons": {
          "accept": "Accept",
          "decline": "Decline"
        },
        "notifications": {
          "accepted": "You are now friends with {name}",
          "rejected": "Request from {name} rejected",
          "error_accepting": "Error accepting request: {error}",
          "error_rejecting": "Error rejecting request: {error}"
        },
        "time": {
          "sent": "Sent {time}",
          "just_now": "just now",
          "minute": "minute",
          "minutes": "minutes",
          "hour": "hour",
          "hours": "hours",
          "day": "day",
          "days": "days",
          "ago": "ago"
        },
        "unknown_user": "Unknown"
      },"friends_list": {
        "title": "Friends",
        "tabs": {
          "friends": "Friends",
          "requests": "Requests",
          "blocked": "Blocked"
        },
        "search": {
          "title": "Find Friends",
          "placeholder": "Search by name or username",
          "hint": "Search for friends by typing their name or username",
          "no_results": "No users found",
          "error": "Error searching: {error}"
        },
        "friend_status": {
          "friend": "Friend",
          "pending": "Pending"
        },
        "actions": {
          "add": "Add",
          "invite": "Invite friends"
        },
        "notifications": {
          "request_sent": "Friend request sent to {name}",
          "request_error": "Error sending friend request: {error}"
        },
        "blocked_users": {
          "empty_title": "No blocked users",
          "empty_message": "Blocked users will appear here",
          "error_loading": "Error loading blocked users: {error}",
          "retry": "Retry"
        },"empty_state": {
          "title": "No friends yet",
          "message": "Add friends to connect with them"
        },
        "error_loading": "Error loading friends: {error}",
        "try_again": "Retry"
      },"add_friend_dialog": {
        "title": "Add Friend",
        "search_placeholder": "Search by name or username",
        "search_hint": "Enter a name to search for users",
        "no_results": "No users found",
        "add_button": "Add",
        "close_button": "Close",
        "error_searching": "Error: {error}",
        "request_sent": "Friend request sent to {name}",
        "request_error": "Error sending friend request: {error}"
      },"blocked_user_card": {
        "blocked_on": "Blocked on {date}",
        "unblock": "Unblock",
        "unblock_title": "Unblock {name}?",
        "unblock_message": "{name} will be able to see your posts and send you friend requests.",
        "cancel": "Cancel",
        "confirm_unblock": "Unblock",
        "unblocked": "{name} has been unblocked",
        "error_unblocking": "Error unblocking user: {error}"
      },"invitation_options_dialog": {
        "title": "Invite Friends",
        "from_contacts": "Invite from Contacts",
        "show_qr": "Show QR Code",
        "share_link": "Share App Link"
      },"notification_center": {
        "title": "Notifications",
        "empty_state": {
          "title": "No notifications yet",
          "message": "Important updates and messages will appear here."
        },
        "actions": {
          "refresh": "Refresh notifications",
          "mark_all_read": "Mark all as read",
          "clear_all": "Clear all notifications"
        },
        "clear_dialog": {
          "title": "Clear all notifications?",
          "message": "This action cannot be undone.",
          "cancel": "CANCEL",
          "confirm": "CLEAR ALL"
        },
        "notifications": {
          "dismissed": "{title} dismissed",
          "error_loading": "Error loading notifications: {error}"
        },
        "time_format": {
          "just_now": "Just now",
          "minutes_ago": "{count}m ago",
          "hours_ago": "{count}h ago",
          "days_ago": "{count}d ago"
        }
      },"card_back_editor": {
        "title": "Design Back Side",
        "tabs": {
          "recipient": "Recipient",
          "sender": "Sender",
          "message": "Message"
        },
        "recipient_form": {
          "title": "Recipient Address",
          "description": "Enter the address of the person who will receive this postal card.",
          "info": "This address will appear on your card exactly as entered."
        },
        "sender_form": {
          "title": "Return Address",
          "description": "Enter your address as the sender of this postal card.",
          "info": "Your return address helps if the card cannot be delivered."
        },
        "message_form": {
          "title": "Personal Message",
          "description": "Write a personal message to include on your postal card (optional).",
          "hint": "Write your message here..."
        },
        "help_dialog": {
          "title": "Designing the Back Side",
          "recipient_title": "Recipient Address",
          "recipient_text": "Enter the full address of the person receiving the postcard.",
          "sender_title": "Sender Address",
          "sender_text": "Provide your return address for the postcard.",
          "message_title": "Personal Message",
          "message_text": "Write a personal message that will appear on the back of the card. You can format your text using the provided tools.",
          "got_it": "Got it"
        },
        "buttons": {
          "previous": "PREVIOUS",
          "next": "NEXT",
          "continue": "CONTINUE TO QR CODE",
          "preview": "PREVIEW CARD",
          "try_again": "Try Again",
          "close_preview": "CLOSE PREVIEW"
        },
        "preview": {
          "title": "Card Preview"
        },
        "loading": {
          "saving": "Saving your changes...",
          "loading": "Loading card design..."
        },
        "errors": {
          "title": "Error Loading Data",
          "unavailable": "Error: Postal drop data not available",
          "field_errors": {
            "name": "Name is required",
            "street": "Street address is required",
            "city": "City is required",
            "state": "State/Province is required",
            "postal_code": "Postal code is required",
            "country": "Country is required"
          },
          "address_type": {
            "recipient": "recipient",
            "sender": "sender"
          },
          "fix_address": "Please fix the {type} address: {error}",
          "save_recipient": "Failed to save recipient address: {error}",
          "save_sender": "Failed to save sender address: {error}",
          "save_message": "Failed to save personal message: {error}",
          "save_data": "Error saving data: {error}",
          "load_data": "Error loading data: {error}"
        },
        "tooltips": {
          "help": "Get Help",
          "preview": "Preview Card"
        }
      },
      "card_front_editor": {
        "title": "Front Design",
        "page_title": "Design Front Side",
        "description": "Add images to create the front side of your postcard.",
        "design_preview": "Your Design",
        "image_selection": {
          "title": "Select an image for the front of your postcard",
          "gallery": "Gallery",
          "camera": "Camera"
        },
        "image_editor": {
          "use_image": "Use This Image",
          "cancel": "Cancel"
        },
        "buttons": {
          "continue": "CONTINUE",
          "add_image": "Add Image",
          "try_again": "Try Again"
        },
        "help_dialog": {
          "title": "Design Your Postcard Front",
          "bullet1": "• Add images to create a beautiful front design",
          "bullet2": "• Select photos from your gallery or take a new picture",
          "bullet3": "• Continue to the back side when you're satisfied",
          "bullet4": "• The front is usually the visual side of your postcard",
          "got_it": "Got it"
        },
        "image_source_dialog": {
          "title": "Select Image Source",
          "gallery": "Gallery",
          "camera": "Camera"
        },
        "errors": {
          "missing_data": "Card information is missing. Please try again.",
          "load_error": "Failed to load your postal card: {error}",
          "general_error": "Error: {error}",
          "image_selection": "Error selecting image: {error}",
          "upload_failed": "Failed to upload image. Please try again.",
          "upload_error": "Error uploading image: {error}",
          "design_error": "Error adding image to design: {error}"
        },
        "success": {
          "image_added": "Image added to your card"
        },
        "loading": {
          "processing": "Processing your image..."
        },
        "tooltips": {
          "help": "Design Help"
        }
      },
      "card_preview": {
        "title": "Card Preview",
        "loading": "Loading preview...",
        "error": {
          "title": "Preview Error",
          "message": "Failed to load data",
          "button": "Try Again"
        },
        "review_title": "Review Your Postal Drop",
        "review_description": "Preview your card and select the type of QR code you want to use.",
        "qr_code": {
          "section_title": "Choose QR Code Type",
          "types": {
            "static": {
              "name": "Static QR",
              "description": "Fixed content that cannot be changed after creation",
              "price": 3.99
            },
            "dynamic": {
              "name": "Dynamic QR",
              "description": "Content can be updated anytime",
              "price": 5.99
            }
          },
          "content_preview_title": "QR Code Content Preview",
          "content_types": {
            "image": "Photo Content",
            "video": "Video Content",
            "audio": "Audio Content",
            "default": "Content Selected"
          },
          "change_button": "Change"
        },
        "information": {
          "title": "How Recipients Will View Your Content",
          "description": "The recipient will scan the QR code with their phone camera to view your digital content. No special app is required for viewing.",
          "dynamic_note": "With a dynamic QR code, you can change the content at any time, even after the card is sent."
        },
        "buttons": {
          "continue": "CONTINUE TO CHECKOUT",
          "add_content": "ADD QR CONTENT FIRST",
          "selected": "Selected: "
        }
      },"checkout": {
        "title": "Checkout",
        "coming_soon": {
          "title": "Checkout Coming Soon!",
          "message": "We're working hard to bring you a seamless checkout experience. Stay tuned!",
          "button": "Go to My Postal Drops"
        }
      },
      "create_postal_drop": {
        "title": "Create Postal Drop",
        "header": {
          "title": "Create a Custom Postal Card",
          "description": "Design a personalized postcard with your photos and message, then add digital content with a QR code."
        },
        "card_type": "Select Card Type",
        "card_details": {
          "dimensions": "Dimensions",
          "paper_type": "Paper Type"
        },
        "card_types": {
          "standard": {
            "name": "Standard Postcard",
            "description": "Classic postcard with a glossy finish"
          },
          "premium": {
            "name": "Premium Postcard",
            "description": "Premium quality with matte finish"
          },
          "square": {
            "name": "Square Postcard",
            "description": "Square format with rounded corners"
          }
        },
        "buttons": {
          "start_designing": "Start Designing"
        },
        "errors": {
          "creation_failed": "Failed to create postal drop"
        }
      },
      "my_postal_drops": {
        "title": "My Postal Drops",
        "tabs": {
          "postal_drops": "Postal Drops",
          "orders": "Orders"
        },
        "refresh": {
          "success": "Data refreshed successfully",
          "error": "Failed to refresh: {error}"
        },
        "empty_states": {
          "drops": {
            "title": "No postal drops yet",
            "message": "Create your first postal drop!"
          },
          "orders": {
            "title": "No orders yet",
            "message": "Complete your postal drop to place an order"
          }
        },
        "section_headers": {
          "drafts": "Drafts",
          "ordered": "Ordered Postal Drops"
        },
        "postal_drop_card": {
          "recipient_label": "To",
          "no_recipient": "No recipient specified",
          "created_on": "Created on {date}",
          "buttons": {
            "delete": "Delete",
            "continue_editing": "Continue Editing",
            "view_details": "View Details"
          }
        },
        "order_card": {
          "order_number": "Order #{id}",
          "shipping": "Shipping: {method}",
          "tracking": "Tracking: {number}",
          "estimated_delivery": "Estimated Delivery: {date}",
          "buttons": {
            "complete_payment": "Complete Payment",
            "view_details": "View Details"
          }
        },
        "delete_dialog": {
          "title": "Delete Draft?",
          "message": "Are you sure you want to delete this draft? This action cannot be undone.",
          "cancel": "Cancel",
          "confirm": "Delete"
        },
        "notifications": {
          "draft_deleted": "Draft deleted successfully",
          "delete_error": "Failed to delete draft: {error}"
        },
        "status": {
          "draft": "Draft",
          "pending_payment": "Pending Payment",
          "processing": "Processing",
          "shipped": "Shipped",
          "delivered": "Delivered",
          "cancelled": "Cancelled"
        },
        "order_status": {
          "created": "Processing",
          "processing": "Processing",
          "paid": "Paid",
          "shipped": "Shipped",
          "delivered": "Delivered",
          "cancelled": "Cancelled",
          "failed": "Failed"
        },
        "create_new": "Create New",
        "retry": "Retry",
        "error_loading": "Error loading data"
      },
      "order_confirmation": {
        "title": "Order Confirmation",
        "success_header": {
          "title": "Order Successful!",
          "subtitle": "Your order has been placed"
        },
        "order_details": {
          "title": "Order Details",
          "order_id": "Order ID",
          "date": "Date",
          "status": "Status",
          "shipping": "Shipping",
          "tracking_number": "Tracking Number",
          "estimated_delivery": "Estimated Delivery"
        },
        "next_steps": {
          "title": "What Happens Next?",
          "steps": {
            "printing": {
              "number": "1",
              "title": "Printing",
              "description": "We'll print your postal card with the QR code."
            },
            "shipping": {
              "number": "2",
              "title": "Shipping",
              "description": "Your card will be shipped to the recipient."
            },
            "tracking": {
              "number": "3",
              "title": "Tracking",
              "description": "You'll receive updates on your order status."
            },
            "delivery": {
              "number": "4",
              "title": "Delivery",
              "description": "The recipient will get your postal drop!"
            }
          }
        },
        "buttons": {
          "view_orders": "VIEW MY ORDERS",
          "back_home": "BACK TO HOME",
          "retry": "Retry",
          "go_to_orders": "Go to My Orders"
        },
        "errors": {
          "load_error": "Failed to load order information"
        }
      },"order_details": {
        "title": "Order Details",
        "order_header": {
          "order_number": "Order #{id}",
          "placed_on": "Placed on {date}"
        },
        "delivery_timeline": {
          "title": "Delivery Status",
          "steps": {
            "order_placed": {
              "title": "Order Placed",
              "description": "Your order has been received"
            },
            "processing": {
              "title": "Processing",
              "description": "Your order is being prepared"
            },
            "shipped": {
              "title": "Shipped",
              "description": "Your postal card is on its way"
            },
            "delivered": {
              "title": "Delivered",
              "description": "Delivered to recipient"
            }
          }
        },
        "tracking": {
          "title": "Tracking Information",
          "shipping_method": "Shipping Method",
          "tracking_number": "Tracking Number: {number}",
          "track_button": "Track Package",
          "tracking_error": "Could not open tracking: {error}"
        },
        "actions": {
          "complete_payment": "COMPLETE PAYMENT"
        },
        "error": {
          "title": "Could not load order details",
          "message": "There was an error loading the order details. Please try again.",
          "retry_button": "Retry"
        },
        "loading": "Loading order details..."
      },"qr_content_selector": {
        "title": "Add QR Content",
        "header": {
          "title": "Add Content to QR Code",
          "description": "Select the type of content you want to add to your QR code."
        },
        "content_types": {
          "image": {
            "title": "Photo",
            "description": "Add a memorable photo"
          },
          "video": {
            "title": "Video",
            "description": "Add a short video clip"
          },
          "audio": {
            "title": "Audio",
            "description": "Add a voice message or song"
          }
        },
        "file_preview": {
          "title": "Selected File:",
          "image": "Image preview",
          "video": "Video file selected",
          "audio": "Audio file selected"
        },
        "buttons": {
          "select_image": "Select Photo",
          "select_video": "Select Video",
          "select_audio": "Select Audio",
          "select_file": "Select File",
          "upload": "UPLOAD AND CONTINUE"
        },
        "info_box": {
          "title": "How QR Codes Work",
          "description": "When someone receives your postcard, they will scan the QR code with their phone to view your digital content. Make sure your content is appropriate and meaningful for the recipient.",
          "file_limits": "File size limits: Images (5MB), Videos (50MB), Audio (20MB)"
        },
        "errors": {
          "select_file": "Please select a file first",
          "file_selection": "Error selecting file: {error}",
          "create_qr": "Error creating QR code: {error}",
          "postal_drop_not_found": "Postal drop not found"
        }
      },
      "qr_scanner": {
        "title": "Scan QR Code",
        "instructions": "Point your camera at a QR code",
        "permissions": {
          "camera_required": "Camera permission is required to scan QR codes",
          "camera_denied": "Camera access was denied. Please enable it in settings to scan QR codes",
          "open_settings": "Open Settings",
          "cancel": "Cancel",
          "grant_access": "Grant Access"
        },
        "loading": "Initializing camera...",
        "error": {
          "title": "Scanner Error",
          "message": "Could not initialize the camera: {error}",
          "button": "Try Again"
        },
        "success": {
          "title": "QR Code Detected",
          "loading": "Processing QR code...",
          "message": "Successfully scanned QR code",
          "content": "Content: {content}"
        },
        "tooltips": {
          "flash": "Toggle flash",
          "gallery": "Select from gallery",
          "close": "Close scanner"
        },
        "no_code_found": "No QR code found in the selected image",
        "gallery_error": "Error selecting image: {error}",
        "processing_error": "Error processing QR code: {error}"
      },
      "address_form": {
        "labels": {
          "recipient_name": "Full Name",
          "sender_name": "Full Name",
          "street": "Street Address",
          "city": "City",
          "state": "State/Province",
          "postal_code": "Postal Code",
          "country": "Country"
        },
        "placeholders": {
          "name": "John Doe",
          "street": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "postal_code": "10001",
          "country": "United States"
        },
        "validation": {
          "required": "This field is required"
        }
      },"validators": {
        "required": "This field is required",
        "email": "Please enter a valid email address",
        "phone": "Please enter a valid phone number",
        "postal_code": "Please enter a valid postal code",
        "min_length": "Must be at least {count} characters long",
        "max_length": "Must be at most {count} characters long"
      },
      "card_preview_widget": {
        "no_design": "No design available",
        "message_label": "Message",
        "address_labels": {
          "to": "TO:",
          "from": "FROM:"
        },
        "instructions": {
          "flip_card": "Tap the card to flip"
        },
        "sides": {
          "front": "Front",
          "back": "Back"
        }
      },"empty_states": {
        "try_again": "Try Again",
        "loading": "Loading...",
        "error": {
          "title": "Oops! Something went wrong",
          "button": "Try Again"
        },
        "no_items": {
          "button": "Create",
          "action": "Add"
        }
      },
      "image_editor": {
        "title": "Image Editor",
        "no_image": "No image selected",
        "edit_toggle": {
          "open": "Edit Image",
          "close": "Close Editor"
        },
        "tools": {
          "crop": "Crop",
          "rotate_left": "Rotate Left",
          "rotate_right": "Rotate Right",
          "compress": "Compress"
        },
        "filters": {
          "title": "Filters",
          "normal": "Normal",
          "grayscale": "Grayscale",
          "sepia": "Sepia",
          "vintage": "Vintage",
          "cool": "Cool",
          "warm": "Warm"
        },
        "adjustments": {
          "title": "Adjustments",
          "brightness": "Brightness",
          "contrast": "Contrast",
          "saturation": "Saturation",
          "apply": "Apply Adjustments"
        },
        "sources": {
          "gallery": "Gallery",
          "camera": "Camera"
        },
        "actions": {
          "use_image": "Use This Image",
          "change_image": "Choose Different Image"
        },
        "processing": "Processing...",
        "errors": {
          "title": "Error",
          "pick_image": "Error picking image: {error}",
          "crop_image": "Error cropping image: {error}",
          "rotate_image": "Error rotating image: {error}",
          "apply_filter": "Error applying filter: {error}",
          "adjust_image": "Error adjusting image: {error}",
          "compress_image": "Error compressing image: {error}"
        }
      },"text_editor": {
        "hint_text": "Enter text here...",
        "formatting": {
          "show": "Show Formatting",
          "hide": "Hide Formatting"
        },
        "tools": {
          "bold": "Bold",
          "italic": "Italic",
          "underline": "Underline",
          "text_color": "Text Color"
        },
        "color_picker": {
          "title": "Pick a color",
          "done": "Done"
        },
        "font_size": {
          "title": "Font Size:"
        }
      },"email_verification": {
        "title": "Verify Your Email",
        "header": "Verification Email Sent",
        "email_sent": "We've sent a verification email to:\n{email}",
        "instructions": "Please check your inbox and click the verification link to complete your registration.",
        "success": "Email verified successfully!",
        "no_email": "Didn't receive the email?",
        "resend": "Resend Verification Email",
        "resend_timer": "Resend in {seconds} seconds",
        "back_to_login": "Back to Login",
        "notification": "Verification email resent!"
      },
      "login_screen": {
        "title": "Welcome Back",
        "subtitle": "Sign in to continue",
        "methods": {
          "phone": "Phone",
          "email": "Email"
        },
        "form": {
          "phone_number": "Phone Number",
          "phone_hint": "123456789",
          "email": "Email",
          "email_hint": "your@email.com",
          "password": "Password",
          "password_hint": "••••••••",
          "otp_info": "A verification code will be sent to this number",
          "remember_me": "Remember me",
          "forgot_password": "Forgot Password?"
        },
        "validation": {
          "phone_required": "Please enter your phone number",
          "phone_invalid": "Please enter a valid phone number",
          "email_required": "Please enter your email",
          "email_invalid": "Please enter a valid email",
          "password_required": "Please enter your password",
          "password_short": "Password must be at least 6 characters"
        },
        "buttons": {
          "sign_in": "SIGN IN",
          "continue": "CONTINUE",
          "or_continue_with": "OR CONTINUE WITH",
          "google": "Sign in with Google",
          "apple": "Sign in with Apple"
        },
        "auth_failed": "Authentication failed: {error}",
        "no_account": "Don't have an account?",
        "sign_up": "Sign up"
      },
      "phone_otp_verification": {
        "title": "Verify Your Number",
        "subtitle": "We sent a verification code via SMS to",
        "verification_error": "Please enter all 6 digits",
        "verify_button": "VERIFY CODE",
        "didnt_receive_code": "Didn't receive the code?",
        "resend_code": "Resend Code",
        "resend_timer": "Resend in {seconds} s",
        "code_resent": "New verification code sent!",
        "resend_failed": "Failed to resend code",
        "tip": {
          "title": "Tip:",
          "message": "Make sure to check your SMS messages. If you don't receive a code within a minute, try resending or verify that your phone number is correct."
        }
      },"profile_completion": {
        "title": "Complete Your Profile",
        "profile_image": {
          "title": "Profile Picture (Optional)",
          "accessibility": {
            "label": "Profile picture selector",
            "hint": "Tap to choose or take a profile picture"
          },
          "actions": {
            "take_photo": "Take a photo",
            "choose_gallery": "Choose from gallery",
            "remove_photo": "Remove photo"
          },
          "notifications": {
            "selected": "Profile image selected",
            "removed": "Profile image removed",
            "error": "Failed to process image: {error}"
          }
        },
        "form": {
          "username": {
            "label": "Username *",
            "hint": "Choose a unique username",
            "helper": "Letters, numbers, underscore, dot, and hyphen only"
          },
          "first_name": {
            "label": "First Name (Optional)",
            "hint": "Enter your first name"
          },
          "last_name": {
            "label": "Last Name (Optional)",
            "hint": "Enter your last name"
          }
        },
        "validation": {
          "username_required": "Username is required",
          "username_min_length": "Username must be at least {count} characters",
          "username_max_length": "Username cannot exceed {count} characters",
          "username_pattern": "Username can only contain letters, numbers, underscore, dot, and hyphen",
          "first_name_max_length": "First name cannot exceed {count} characters",
          "last_name_max_length": "Last name cannot exceed {count} characters"
        },
        "buttons": {
          "complete_profile": "COMPLETE PROFILE",
          "retry": "RETRY"
        },
        "notifications": {
          "completion_failed": "Failed to complete profile",
          "general_error": "Error: {error}"
        }
      },
      "profile_screen": {
        "title": "Profile",
        "profile_settings": "Profile Settings",
        "fields": {
          "username": "Username",
          "first_name": "First Name",
          "last_name": "Last Name",
          "email": "Email",
          "phone": "Phone"
        },
        "appearance": {
          "dark_mode": "Dark Mode"
        },
        "tooltips": {
          "update_profile_picture": "Update profile picture",
          "refresh": "Refresh profile"
        },
        "actions": {
          "edit": "Edit",
          "save": "Save",
          "cancel": "Cancel",
          "logout": "Logout",
          "delete_account": "Delete Account"
        },
        "edit_restrictions": {
          "email_edit": "Only @drop emails can be edited",
          "phone_edit": "Phone can only be edited if empty"
        },
        "delete_account_dialog": {
          "title": "Delete Account",
          "message": "Are you sure you want to delete your account? This action cannot be undone.",
          "cancel": "Cancel",
          "confirm": "Delete"
        },
        "notifications": {
          "profile_updated": "Profile updated successfully",
          "update_failed": "Error updating profile: {error}",
          "refresh_failed": "Error refreshing profile: {error}"
        }
      },"register_screen": {
        "title": "Register",
        "header_icon": "Register account icon",
        "validation": {
          "email_required": "Please enter your email",
          "email_invalid": "Please enter a valid email",
          "password_required": "Please enter a password",
          "password_short": "Password must be at least 6 characters",
          "confirm_password_required": "Please confirm your password",
          "passwords_not_match": "Passwords do not match"
        },
        "form": {
          "email": {
            "label": "Email",
            "hint": "Enter your email address"
          },
          "password": {
            "label": "Password",
            "hint": "Enter a secure password"
          },
          "confirm_password": {
            "label": "Confirm Password",
            "hint": "Enter the same password again"
          }
        },
        "buttons": {
          "register": "REGISTER",
          "have_account": "Already have an account? Login"
        }
      }
      },
      'fr': {
        "about": "À propos",
        "accept_request": "Accepter la demande",
        "accessibility": {
          "friend_selector": "Ouvrir la liste d'amis",
          "navigate_forward": "Continuer"
        },
        "account_settings": "Paramètres du compte",
        "add_friend": "Ajouter un ami",
        "agree_terms": "J'accepte les",
        "and": "et",
        "app_name": "Drops",
        "apply": "Appliquer",
        "audio_call": "Appel audio",
        "away": "loin",
        "back": "Retour",
        "block_user": "Bloquer l'utilisateur",
        "camera_permission": "Nous avons besoin d'accéder à la caméra pour prendre des photos",
        "cancel": "Annuler",
        "change_language": "Changer la langue de l'application",
        "change_password": "Changer le mot de passe",
        "chat": {
          "cancel": "Annuler",
          "custom_message": {
            "locked": "Verrouillé",
            "unlocked": "Déverrouillé",
            "view_drop": "Voir le Drop"
          },
          "default_title": "Discussion",
          "delete": "Supprimer",
          "delete_confirmation": "Êtes-vous sûr de vouloir supprimer ce message ?",
          "delete_title": "Supprimer le message",
          "download_error": "Erreur lors du téléchargement du fichier : {error}",
          "image_load_error": "Impossible de charger l'image",
          "load_error": "Échec du chargement des messages : {error}",
          "loading": "Chargement...",
          "media_picker": {
            "cancel": "Annuler",
            "file": "Fichier",
            "photo": "Photo"
          },
          "send_error": "Échec de l'envoi du message : {error}",
          "send_file_error": "Échec de l'envoi du fichier : {error}",
          "send_image_error": "Échec de l'envoi de l'image : {error}",
          "uploading": "Téléchargement de la pièce jointe..."
        },
        "choose_language": "Choisissez votre langue",
        "clear_all": "Tout effacer",
        "confirm": "Confirmer",
        "continue": "Continuer",
        "conversation_info": {
          "admin_role": "Administrateur",
          "edit_group": {
            "coming_soon": "Modification du nom de groupe bientôt disponible",
            "title": "Modifier le nom du groupe"
          },
          "group_chat": "Discussion de groupe",
          "leave": {
            "button": "Quitter la conversation",
            "cancel": "ANNULER",
            "confirm": "QUITTER",
            "dialog_message": "Êtes-vous sûr de vouloir quitter cette conversation? Vous ne recevrez plus de nouveaux messages.",
            "dialog_title": "Quitter la conversation?",
            "failure": "Échec lors du départ de la conversation: {error}",
            "success": "Vous avez quitté la conversation"
          },
          "members_count": "{count} membres",
          "members_section": "MEMBRES",
          "shared_media": {
            "coming_soon": "Médias partagés bientôt disponibles",
            "title": "Médias partagés"
          },
          "title": "Informations sur la conversation",
          "you": "Vous"
        },
        "conversation_list_item": {
          "group_chat": "Discussion de groupe",
          "yesterday": "Hier",
          "no_messages": "Pas encore de messages",
          "you": "Vous : "
        },
        "country_code": "Indicatif du pays",
        "create": "Créer",
        "create_drop": "Créer un Drop",
        "created": "Créé",
        "dark_theme": "Thème sombre",
        "decline_request": "Refuser la demande",
        "delete": "Supprimer",
        "delete_account": "Supprimer le compte",
        "deleted_message": "Ce message a été supprimé",
        "digital_drop": "Drop Digital",
        "digital_drop_creation": {
          "accessibility": {
            "audio": "Enregistrer l'audio",
            "camera": "Prendre une photo ou une vidéo",
            "expand_map": "Agrandir la carte",
            "image": "Sélectionner une image de la galerie",
            "music": "Sélectionner de la musique",
            "shrink_map": "Réduire la carte"
          },
          "errors": {
            "add_media": "Veuillez ajouter un média",
            "microphone_permission": "Permission du microphone requise",
            "music_feature": "Fonctionnalité musicale bientôt disponible !",
            "select_friend": "Veuillez sélectionner au moins un ami",
            "stop_recording": "Veuillez arrêter l'enregistrement audio d'abord"
          },
          "select_location": "Sélectionner un lieu",
          "send_drop": "Envoyer le Drop",
          "title": "Créer un Drop Digital"
        },
        "discard": "Annuler",
        "distance": "Distance",
        
        "drop_type_selection": {
          "digital_drop": {
            "description": "Partagez vos moments instantanément.",
            "title": "Drop Digital"
          },
          "postal_drop": {
            "description": "Envoyez vos souvenirs par carte postale.",
            "title": "Drop postal"
          },
          "subtitle": "Sélectionnez comment partager vos souvenirs.",
          "title": "Créer un Drop",
          "find_friends": "Trouver des Amis"
        },
        "drops": "Drops",
        "edit": "Modifier",
        "email": "E-mail",
        "empty_list": "Rien à afficher",
        "enable_location": "Veuillez activer les services de localisation.",
        "error_occurred": "Une erreur s'est produite",
        "expires_in": "Expire dans",
        "explore": "Explorer",
        "feedback": "Commentaires",
        "forgot_password": "Mot de passe oublié?",
        "friend_drops": "Drops d'Amis",
        "friend_request_sent": "Demande d'ami envoyée",
        "friends": "Amis",
        "gallery": "Galerie",
        "gallery_access_error": "Erreur d'accès à la galerie",
        "help": "Aide",
        "home": "Accueil",
        "image_saved_success": "Image enregistrée avec succès!",
        "invite_friends": "Inviter des amis",
        "language": "Langue",
        "language_settings": "Paramètres de langue",
        "last_seen": "Vu pour la dernière fois",
        "light_theme": "Thème clair",
        "loading": "Chargement...",
        "location_access": "Nous avons besoin d'accéder à votre position pour afficher les drops à proximité",
        "location_denied": "L'autorisation de localisation a été refusée. Veuillez l'activer dans les paramètres.",
        "location_permission": "Permission de localisation",
        "location_services": "Services de localisation",
        "log_out": "Se déconnecter",
        "login": "Connexion",
        "mark_all_read": "Tout marquer comme lu",
        "messages": "Messages",
        "my_location": "Ma position",
        "nearby": "À proximité",
        "new_message": "Nouveau message",
        "next": "Suivant",
        "no_items": "Aucun élément trouvé",
        "no_notifications": "Vous n'avez pas encore de notifications.",
        "not_found": "Non trouvé",
        "notification_settings": "Paramètres de notification",
        "notifications": "Notifications",
        "offline": "Hors ligne",
        "online": "En ligne",
        "order_summary": "Récapitulatif de la commande",
        "password": "Mot de passe",
        "payment": "Paiement",
        "phone_number": "Numéro de téléphone",
        "postal_drop": "Drop Postal",
        "preview": "Aperçu",
        "privacy_policy": "Politique de confidentialité",
        "profile": "Profil",
        "rate_app": "Évaluer l'application",
        "recently": "Récemment",
        "recipient": "Destinataire",
        "record_video": "Enregistrer une vidéo",
        "register": "S'inscrire",
        "remove_friend": "Supprimer l'ami",
        "report_user": "Signaler l'utilisateur",
        "reset": "Réinitialiser",
        "retake": "Reprendre",
        "save": "Enregistrer",
        "search": "Rechercher",
        "search_location": "Rechercher un lieu",
        "select_country": "Sélectionner un pays",
        "send": "Envoyer",
        "sender": "Expéditeur",
        "settings": "Paramètres",
        "settings_button": "Paramètres",
        "share_app": "Partager l'application",
        "shipping": "Livraison",
        "sign_in": "Se connecter",
        "sign_up": "S'inscrire",
        "skip": "Passer",
        "storage_permission": "Nous avons besoin d'accéder au stockage pour enregistrer des photos",
        "system_theme": "Thème système",
        "take_photo": "Prendre une photo",
        "terms_conditions": "Conditions générales",
        "theme": "Thème",
        "today": "Aujourd'hui",
        "total": "Total",
        "try_again": "Réessayer",
        "typing": "en train d'écrire...",
        "unblock_user": "Débloquer l'utilisateur",
        "user_blocked": "Utilisateur bloqué",
        "user_unblocked": "Utilisateur débloqué",
        "video_call": "Appel vidéo",
        "video_recording_completed": "Enregistrement vidéo terminé",
        "video_saved_success": "Vidéo enregistrée avec succès!",
        "view_profile": "Voir le profil",
        "welcome": "Bienvenue",
        "yesterday": "Hier",
        "conversations_list": {
        "title": "Messages",
        "tooltips": {
          "refresh": "Actualiser les conversations",
          "search": "Rechercher des conversations"
        },
        "notifications": {
          "search_coming_soon": "Recherche bientôt disponible",
          "conversation_deleted": "Conversation supprimée",
          "error_loading": "Erreur lors du chargement des conversations : {error}"
        },
        "empty_state": {
          "no_conversations": "Pas encore de conversations",
          "start_message": "Commencez à discuter avec vos amis",
          "start_button": "Démarrer une conversation"
        },
        "error_state": {
          "title": "Impossible de charger les conversations",
          "message": "Tirez vers le bas pour actualiser ou réessayez plus tard",
          "button": "Réessayer"
        }
      },
      "new_conversation": {
        "title": "New Conversation",
        "search_friends": "Search Friends",
        "search_placeholder": "Enter a name",
        "group_name": "Group Name (Optional)",
        "group_name_placeholder": "Enter a name for your group",
        "empty_search": "No friends match your search",
        "no_friends": "No friends yet",
        "select_friend": "Please select at least one friend",
        "create_error": "Failed to create conversation",
        "error_loading": "Error loading friends: {error}",
        "try_again": "Try Again",
        "tooltips": {
          "group_chat": "Group Chat",
          "direct_message": "Direct Message",
          "clear_search": "Clear search",
          "create_conversation": "Create conversation"
        }
      },
      "typing_indicator": {
        "single_user": "{user} est en train d'écrire",
        "two_users": "{user1} et {user2} sont en train d'écrire",
        "multiple_users": "Plusieurs personnes sont en train d'écrire"
      },
      "friend_selection": {
        "select_friend": "Sélectionner {name}",
        "deselect_friend": "Désélectionner {name}",
        "online_status": "En ligne",
        "profile_image": "Photo de profil de {name}"
      },
      "user_avatar": {
        "accessibility_label": "Photo de profil de {name}",
        "error_loading": "Erreur lors du chargement de la photo de profil de {name}"
      },"camera": {
        "gallery": "Galerie",
        "gallery_access_error": "Erreur d'accès à la galerie",
        "video_recording_completed": "Enregistrement vidéo terminé",
        "retake": "Reprendre",
        "confirm": "Confirmer",
        "tooltips": {
          "switch_camera": "Changer de caméra",
          "take_photo": "Prendre une photo",
          "start_recording": "Démarrer l'enregistrement",
          "stop_recording": "Arrêter l'enregistrement",
          "open_gallery": "Ouvrir la galerie"
        },
        "accessibility": {
          "camera_preview": "Aperçu de la caméra",
          "image_preview": "Aperçu de l'image",
          "video_preview": "Aperçu de la vidéo",
          "play_video": "Lire la vidéo",
          "pause_video": "Mettre la vidéo en pause"
        }
      },
      "drop_sending": {
        "success_title": "Drop envoyé avec succès !",
        "continue_button": "Continuer",
        "error_title": "Échec de l'envoi du drop",
        "retry_button": "Réessayer",
        "error_message": "Erreur: {error}",
        "done": "Terminé",
          "error": "Échec de l'Envoi",
          "error_description": "Une erreur s'est produite lors de l'envoi de votre drop. Veuillez réessayer.",
          "retry": "Réessayer",
          "sending": "Envoi de votre drop en cours...",
          "success": "Drop Envoyé !",
          "success_description": "Votre drop a été envoyé à vos amis.",
          "title": "Envoyer le Drop",
        "accessibility": {
          "success_animation": "Animation de succès montrant une épingle déposée",
          "error_icon": "Icône d'erreur",
          "back": "Retourner à l'écran d'accueil",
            "loading": "Envoi du drop en cours"
        }
      },"friend_selector": {
        "title": "Sélectionner des amis",
        "search_placeholder": "Rechercher des amis",
        "no_friends": "Aucun ami trouvé",
        "selected_count": "{count} sélectionné(s)",
        "done_button": "Terminé",
        "cancel_button": "Annuler",
        "send_button": "Envoyer",
        "continue_button": "Continuer"
      },"image_edit": {
        "title": "Modifier l'image",
        "error_opening_editor": "Erreur lors de l'ouverture de l'éditeur : {error}",
        "tooltips": {
          "repick_image": "Choisir une autre image",
          "edit_image": "Modifier l'image",
          "confirm_image": "Confirmer l'image"
        },
        "accessibility": {
          "image_preview": "Aperçu de l'image",
          "edit_buttons": "Options de modification d'image"
        }
      },
      "sending_animation": {
        "title": "Envoi de Votre Drop...",
        "accessibility": {
          "loading": "Envoi du drop en cours"
        }
      },
      "drop_detail": {
        "title": "Détails du Drop",
        "not_found": "Drop Non Trouvé",
        "error_loading": "Erreur lors du chargement du drop",
        "try_again": "Réessayer",
        "drop_not_found_message": "Le drop demandé n'a pas pu être trouvé",
        "drop_by": "Drop par {name}",
        "get_nearby": "Approchez-vous pour débloquer",
        "distance": {
          "meters_away": "à {distance} mètres",
          "km_away": "à {distance} km"
        },
        "time_ago": {
          "just_now": "à l'instant",
          "minute_ago": "il y a {count} minute",
          "minutes_ago": "il y a {count} minutes",
          "hour_ago": "il y a {count} heure",
          "hours_ago": "il y a {count} heures",
          "day_ago": "il y a {count} jour",
          "days_ago": "il y a {count} jours"
        },
        "shared": {
          "title": "Partagé avec",
          "empty": "Ce drop n'a été partagé avec personne.",
          "shared_ago": "Partagé {time_ago}"
        },
        "posted_ago": "Publié {time_ago}",
        "navigate_button": "Naviguer vers le Drop",
        "tooltips": {
          "refresh_location": "Actualiser la position",
          "shared_users": "Voir les utilisateurs partagés"
        },
        "maps": {
          "error": "Impossible d'ouvrir l'application de cartes",
          "no_location": "Aucune information de localisation disponible"
        },
        "close": "Fermer"
      },
      "drops_overview": {
        "title": "Mes Drops",
        "loading": "Chargement des drops...",
        "error": "Erreur lors du chargement des drops",
        "categories": {
          "my_drops": "Mes Drops",
          "shared_with_me": "Partagés avec moi",
          "explore_nearby": "Explorer à proximité"
        },
        "empty_state": {
          "title": "Pas encore de drops",
          "message": "Créez votre premier drop pour commencer",
          "button": "Créer un Drop"
        },
        "refresh": "Tirez vers le bas pour actualiser"
      },
      "explore_drops": {
        "title": "Explorer les Drops",
        "tabs": {
          "explore": "Explorer",
          "my_drops": "Mes Drops"
        },
        "tooltips": {
          "switch_to_satellite": "Passer en vue satellite",
          "switch_to_map": "Passer en vue carte",
          "refresh": "Actualiser les drops",
          "my_location": "Aller à ma position"
        },
        "errors": {
          "loading_drops": "Erreur lors du chargement des drops à proximité : {error}",
          "location_access": "Impossible d'accéder à votre position",
          "refresh_failed": "Erreur lors de l'actualisation des drops",
          "location_permission_denied": "Impossible d'accéder à votre position. Veuillez vérifier vos autorisations."
        },
        "loading": {
          "initializing_map": "Initialisation de la carte...",
          "loading_drops": "Chargement des drops...",
          "processing_drops": "Traitement de {current} sur {total} drops"
        },
        "empty_state": {
          "no_drops": "Aucun drop trouvé à proximité. Déplacez la carte pour en découvrir davantage ou réessayez plus tard.",
          "no_my_drops": "Vous n'avez pas encore de drops."
        },
        "location_permission": {
          "title": "Accès à la Position Requis",
          "enable_button": "Activer l'accès à la position"
        }
      },
      "friends_drops": {
        "title": "Partagés avec moi",
        "error_loading": "Erreur lors du chargement des drops partagés",
        "empty_state": {
          "title": "Pas de drops partagés",
          "message": "Lorsque vos amis partageront des drops avec vous, ils apparaîtront ici."
        }
      },
      "my_drops": {
        "title": "Mes Drops",
        "filter": {
          "button_tooltip": "Filtrer les drops",
          "all": "Tous les Drops",
          "today": "Aujourd'hui",
          "this_week": "Cette Semaine",
          "this_month": "Ce Mois-ci",
          "older": "Plus Anciens",
          "filter": {
            "title": "Filtrer les Drops",
            "all": "Tous les Drops",
            "all_description": "Afficher tous vos drops",
            "digital": "Drops Numériques",
            "digital_description": "Uniquement les drops numériques",
            "postal": "Drops Postaux",
            "postal_description": "Uniquement les drops postaux",
            "recent": "Plus Récents d'abord",
            "recent_description": "Trier par date récente",
            "oldest": "Plus Anciens d'abord",
            "oldest_description": "Trier par date ancienne"
          }
        },
        "loading": "Chargement de vos drops...",
        "error_loading": "Erreur lors du chargement des drops",
        "empty_state": {
          "title": "Pas encore de drops",
          "message": "Créez votre premier drop pour commencer",
          "button": "Créer un Drop"
        },
        "no_filtered_results": "Aucun drop ne correspond à votre filtre actuel"
      },
      "drop_card": {
        "locked": "Approchez-vous pour débloquer",
        "navigate": "Naviguer",
        "created": "Créé le {date}",
        "shared_by": "Partagé par {name}",
        "distance": {
          "kilometers": "{distance} km",
          "meters": "{distance} m"
        },
        "errors": {
          "invalid_location": "Coordonnées de localisation invalides",
          "maps_open_error": "Impossible d'ouvrir les cartes",
          "general_error": "Erreur : {error}"
        },
        "media": {
          "audio": "Enregistrement audio",
          "accessibility": {
            "locked_content": "Contenu verrouillé, approchez-vous pour débloquer",
            "play_audio": "Lire l'enregistrement audio"
          }
        }
      },"drop_type_indicator": {
        "digital": "Digital",
        "postal": "Postal",
        "accessibility": {
          "digital": "Drop digital",
          "postal": "Drop postal"
        }
      },
      "locked_fullscreen_image": {
        "navigation": {
          "title": "Navigation vers le Drop",
          "location_unavailable": "Coordonnées de localisation non disponibles",
          "could_not_open_maps": "Impossible d'ouvrir les cartes",
          "error_opening_maps": "Erreur lors de l'ouverture des cartes : {error}"
        },
        "unlock": {
          "success": "Contenu déverrouillé avec succès !",
          "unlocking": "Déverrouillage...",
          "unlock_now": "Déverrouiller",
          "tap_unlock": "Appuyez sur le bouton pour voir ce contenu",
          "get_closer": "Rapprochez-vous pour déverrouiller ce contenu",
          "distance_away": "Vous êtes à {distance}km",
          "distance_required": "Vous devez être à moins de {unlockDistance}km pour déverrouiller. Distance actuelle : {currentDistance}km",
          "navigate": "Naviguer",
          "failed": "Impossible de charger l'image"
        },
        "accessibility": {
          "go_back": "Retour",
          "unlock_content": "Déverrouiller le contenu",
          "unlock_button": "Bouton pour déverrouiller le contenu",
          "navigation_button": "Naviguer vers l'emplacement du drop"
        }
      },"my_drops_tab_bar": {
        "all": "Tous",
        "my_drops": "Mes Drops",
        "shared": "Partagés",
        "accessibility": {
          "tab_selector": "Sélectionner l'onglet : {tab_name}"
        }
      },"navigation_map_screen": {
        "title": "Navigation",
        "errors": {
          "location_services_disabled": "Les services de localisation sont désactivés",
          "location_permission_denied": "Les autorisations de localisation sont refusées",
          "permanent_permission_denied": "Les autorisations de localisation sont définitivement refusées",
          "initializing_location": "Erreur lors de l'initialisation de la localisation : {error}",
          "tracking_location": "Erreur lors du suivi de la localisation : {error}",
          "updating_map": "Erreur lors de la mise à jour de la carte : {error}",
          "zooming": "Erreur lors du zoom sur votre position : {error}"
        },
        "markers": {
          "drop": {
            "title": "Votre Drop",
            "snippet": "Destination"
          },
          "current_location": {
            "title": "Votre Position",
            "distance_away": "à {distance} km",
            "snippet": "Position actuelle"
          }
        },
        "distance_indicator": "Distance : {distance} km",
        "tooltips": {
          "center_map": "Centrer la carte pour montrer les deux points",
          "zoom_location": "Zoomer sur votre position",
          "back": "Retour"
        }
      },"app_qr_code": {
        "title": "Inviter des Amis",
        "scan_title": "Scannez pour télécharger l'application",
        "app_store": "App Store",
        "google_play": "Google Play",
        "copy_link": "Copier le Lien",
        "share": "Partager",
        "link_copied": "Lien copié dans le presse-papiers",
        "accessibility": {
          "qr_code": "Code QR pour télécharger l'application",
          "app_store_qr": "Code QR pour téléchargement sur l'App Store",
          "google_play_qr": "Code QR pour téléchargement sur Google Play"
        }
      },"blocked_users": {
        "title": "Utilisateurs Bloqués",
        "empty_state": {
          "title": "Aucun utilisateur bloqué",
          "message": "Lorsque vous bloquez quelqu'un, il apparaîtra ici"
        },
        "error": {
          "loading": "Erreur lors du chargement des utilisateurs bloqués : {error}",
          "retry": "Réessayer"
        },
        "loading": "Chargement des utilisateurs bloqués..."
      },"no_phone": "Pas de téléphone",
      "contact_invitation": {
        "title": "Inviter des Contacts",
        "search_placeholder": "Rechercher des contacts",
        "permission": {
          "title": "Permission Requise",
          "message": {
            "ios": "Pour inviter vos contacts, nous avons besoin d'accéder à vos contacts.",
            "android": "Pour inviter vos contacts, nous avons besoin d'accéder à vos contacts."
          },
          "settings_message": {
            "ios": "Pour inviter vos contacts, activez l'accès aux contacts dans Paramètres > Confidentialité > Contacts > App Drops.",
            "android": "Pour inviter vos contacts, nous avons besoin d'accéder à votre liste de contacts."
          },
          "denied_title": "Permission de Contacts Requise",
          "denied_message": "Pour inviter vos contacts, nous avons besoin d'accéder à votre liste de contacts.",
          "steps": {
            "ios": [
              "1. Appuyez sur \"Ouvrir les Paramètres\" ci-dessous",
              "2. Sélectionnez \"Confidentialité et Sécurité\"",
              "3. Appuyez sur \"Contacts\"",
              "4. Trouvez \"App Drops\" dans la liste",
              "5. Activez l'interrupteur",
              "6. Retournez à l'application et appuyez sur \"Réessayer\""
            ]
          }
        },
        "buttons": {
          "open_settings": "Ouvrir les Paramètres",
          "try_again": "Réessayer",
          "later": "Plus tard",
          "cancel": "ANNULER",
          "invite": "Inviter",
          "retry": "Réessayer"
        },
        "empty_state": {
          "title": "Aucun contact trouvé",
          "message": "Aucun contact n'a été trouvé sur votre appareil"
        },
        "errors": {
          "access": "Erreur d'accès aux contacts : {error}",
          "loading": "Erreur lors du chargement des contacts : {error}",
          "invitation": "Erreur : {error}",
          "settings": "Impossible d'ouvrir les paramètres automatiquement",
          "send": "Impossible d'envoyer l'invitation"
        },
        "success": "Invitation envoyée à {name}"
      },"friend_profile": {
        "title": "Profil d'ami",
        "online": "En ligne",
        "offline": "Hors ligne",
        "last_seen": "Vu pour la dernière fois {time}",
        "just_now": "à l'instant",
        "minute_ago": "il y a {count} minute",
        "minutes_ago": "il y a {count} minutes",
        "hour_ago": "il y a {count} heure",
        "hours_ago": "il y a {count} heures",
        "day_ago": "il y a {count} jour",
        "days_ago": "il y a {count} jours",
        "actions": {
          "message": "Message",
          "video_call": "Appel vidéo",
          "video_call_coming_soon": "Fonction d'appel vidéo bientôt disponible !"
        },
        "menu": {
          "block": "Bloquer",
          "remove": "Supprimer l'ami"
        },
        "confirmation": {
          "block_title": "Bloquer {name} ?",
          "block_message": "Cet utilisateur ne pourra plus voir votre profil ni vous envoyer de messages.",
          "block_button": "Bloquer",
          "remove_title": "Supprimer {name} ?",
          "remove_message": "Cette personne sera supprimée de votre liste d'amis.",
          "remove_button": "Supprimer",
          "cancel": "Annuler"
        },
        "notifications": {
          "user_blocked": "{name} a été bloqué",
          "user_removed": "{name} a été supprimé de vos amis"
        },
        "mutual_friends": {
          "title": "Amis en commun",
          "empty": "Pas encore d'amis en commun",
          "error": "Échec du chargement des amis en commun : {error}"
        }
      },"friend_requests": {
        "title": "Demandes d'Amis",
        "empty_state": {
          "title": "Pas de demandes d'amis",
          "message": "Lorsque quelqu'un vous envoie une demande d'ami, elle apparaîtra ici"
        },
        "error_loading": "Erreur lors du chargement des demandes : {error}",
        "try_again": "Réessayer",
        "loading": "Chargement des demandes d'amis...",
        "buttons": {
          "accept": "Accepter",
          "decline": "Refuser"
        },
        "notifications": {
          "accepted": "Vous êtes maintenant ami(e) avec {name}",
          "rejected": "Demande de {name} refusée",
          "error_accepting": "Erreur lors de l'acceptation de la demande : {error}",
          "error_rejecting": "Erreur lors du refus de la demande : {error}"
        },
        "time": {
          "sent": "Envoyé {time}",
          "just_now": "à l'instant",
          "minute": "minute",
          "minutes": "minutes",
          "hour": "heure",
          "hours": "heures",
          "day": "jour",
          "days": "jours",
          "ago": "il y a"
        },
        "unknown_user": "Inconnu"
      },"friends_list": {
        "empty_state": {
          "title": "Pas encore d'amis",
          "message": "Ajoutez des amis pour vous connecter avec eux"
        },
        "error_loading": "Erreur lors du chargement des amis : {error}",
        "try_again": "Réessayer",
        "title": "Amis",
        "tabs": {
          "friends": "Amis",
          "requests": "Demandes",
          "blocked": "Bloqués"
        },
        "search": {
          "title": "Rechercher des Amis",
          "placeholder": "Rechercher par nom ou nom d'utilisateur",
          "hint": "Recherchez des amis en tapant leur nom ou leur nom d'utilisateur",
          "no_results": "Aucun utilisateur trouvé",
          "error": "Erreur de recherche : {error}"
        },
        "friend_status": {
          "friend": "Ami",
          "pending": "En attente"
        },
        "actions": {
          "add": "Ajouter",
          "invite": "Inviter des amis"
        },
        "notifications": {
          "request_sent": "Demande d'ami envoyée à {name}",
          "request_error": "Erreur lors de l'envoi de la demande d'ami : {error}"
        },
        "blocked_users": {
          "empty_title": "Aucun utilisateur bloqué",
          "empty_message": "Les utilisateurs bloqués apparaîtront ici",
          "error_loading": "Erreur lors du chargement des utilisateurs bloqués : {error}",
          "retry": "Réessayer"
        }
      },"add_friend_dialog": {
        "title": "Ajouter un Ami",
        "search_placeholder": "Rechercher par nom ou nom d'utilisateur",
        "search_hint": "Entrez un nom pour rechercher des utilisateurs",
        "no_results": "Aucun utilisateur trouvé",
        "add_button": "Ajouter",
        "close_button": "Fermer",
        "error_searching": "Erreur : {error}",
        "request_sent": "Demande d'ami envoyée à {name}",
        "request_error": "Erreur lors de l'envoi de la demande d'ami : {error}"
      },"blocked_user_card": {
        "blocked_on": "Bloqué le {date}",
        "unblock": "Débloquer",
        "unblock_title": "Débloquer {name} ?",
        "unblock_message": "{name} pourra voir vos publications et vous envoyer des demandes d'ami.",
        "cancel": "Annuler",
        "confirm_unblock": "Débloquer",
        "unblocked": "{name} a été débloqué",
        "error_unblocking": "Erreur lors du déblocage : {error}"
      },"invitation_options_dialog": {
        "title": "Inviter des Amis",
        "from_contacts": "Inviter des Contacts",
        "show_qr": "Afficher le Code QR",
        "share_link": "Partager le Lien de l'App"
      },"notification_center": {
        "title": "Notifications",
        "empty_state": {
          "title": "Pas encore de notifications",
          "message": "Les mises à jour et messages importants apparaîtront ici."
        },
        "actions": {
          "refresh": "Actualiser les notifications",
          "mark_all_read": "Tout marquer comme lu",
          "clear_all": "Supprimer toutes les notifications"
        },
        "clear_dialog": {
          "title": "Supprimer toutes les notifications ?",
          "message": "Cette action ne peut pas être annulée.",
          "cancel": "ANNULER",
          "confirm": "TOUT SUPPRIMER"
        },
        "notifications": {
          "dismissed": "{title} supprimée",
          "error_loading": "Erreur lors du chargement des notifications : {error}"
        },
        "time_format": {
          "just_now": "À l'instant",
          "minutes_ago": "Il y a {count}m",
          "hours_ago": "Il y a {count}h",
          "days_ago": "Il y a {count}j"
        }
      },"card_back_editor": {
        "title": "Concevoir le Verso",
        "tabs": {
          "recipient": "Destinataire",
          "sender": "Expéditeur",
          "message": "Message"
        },
        "recipient_form": {
          "title": "Adresse du Destinataire",
          "description": "Entrez l'adresse de la personne qui recevra cette carte postale.",
          "info": "Cette adresse apparaîtra sur votre carte exactement comme saisie."
        },
        "sender_form": {
          "title": "Adresse de Retour",
          "description": "Entrez votre adresse en tant qu'expéditeur de cette carte postale.",
          "info": "Votre adresse de retour aide si la carte ne peut pas être livrée."
        },
        "message_form": {
          "title": "Message Personnel",
          "description": "Écrivez un message personnel à inclure sur votre carte postale (facultatif).",
          "hint": "Écrivez votre message ici..."
        },
        "help_dialog": {
          "title": "Conception du Verso",
          "recipient_title": "Adresse du Destinataire",
          "recipient_text": "Entrez l'adresse complète de la personne qui reçoit la carte postale.",
          "sender_title": "Adresse de l'Expéditeur",
          "sender_text": "Fournissez votre adresse de retour pour la carte postale.",
          "message_title": "Message Personnel",
          "message_text": "Écrivez un message personnel qui apparaîtra au verso de la carte. Vous pouvez formater votre texte à l'aide des outils fournis.",
          "got_it": "Compris"
        },
        "buttons": {
          "previous": "PRÉCÉDENT",
          "next": "SUIVANT",
          "continue": "CONTINUER AU CODE QR",
          "preview": "APERÇU DE LA CARTE",
          "try_again": "Réessayer",
          "close_preview": "FERMER L'APERÇU"
        },
        "preview": {
          "title": "Aperçu de la Carte"
        },
        "loading": {
          "saving": "Enregistrement de vos modifications...",
          "loading": "Chargement du design de la carte..."
        },
        "errors": {
          "title": "Erreur de Chargement des Données",
          "unavailable": "Erreur: Données de drop postal non disponibles",
          "field_errors": {
            "name": "Le nom est requis",
            "street": "L'adresse est requise",
            "city": "La ville est requise",
            "state": "L'état/province est requis",
            "postal_code": "Le code postal est requis",
            "country": "Le pays est requis"
          },
          "address_type": {
            "recipient": "destinataire",
            "sender": "expéditeur"
          },
          "fix_address": "Veuillez corriger l'adresse du {type} : {error}",
          "save_recipient": "Échec de l'enregistrement de l'adresse du destinataire : {error}",
          "save_sender": "Échec de l'enregistrement de l'adresse de l'expéditeur : {error}",
          "save_message": "Échec de l'enregistrement du message personnel : {error}",
          "save_data": "Erreur lors de l'enregistrement des données : {error}",
          "load_data": "Erreur lors du chargement des données : {error}"
        },
        "tooltips": {
          "help": "Obtenir de l'Aide",
          "preview": "Aperçu de la Carte"
        }
      },
      "card_front_editor": {
        "title": "Conception du Recto",
        "page_title": "Concevoir le Recto",
        "description": "Ajoutez des images pour créer le recto de votre carte postale.",
        "design_preview": "Votre Design",
        "image_selection": {
          "title": "Sélectionnez une image pour le recto de votre carte postale",
          "gallery": "Galerie",
          "camera": "Caméra"
        },
        "image_editor": {
          "use_image": "Utiliser cette image",
          "cancel": "Annuler"
        },
        "buttons": {
          "continue": "CONTINUER",
          "add_image": "Ajouter une image",
          "try_again": "Réessayer"
        },
        "help_dialog": {
          "title": "Conception du Recto de la Carte",
          "bullet1": "• Ajoutez des images pour créer un beau design de face",
          "bullet2": "• Sélectionnez des photos de votre galerie ou prenez une nouvelle photo",
          "bullet3": "• Continuez au verso quand vous êtes satisfait",
          "bullet4": "• Le recto est généralement le côté visuel de votre carte postale",
          "got_it": "Compris"
        },
        "image_source_dialog": {
          "title": "Sélectionnez une source d'image",
          "gallery": "Galerie",
          "camera": "Caméra"
        },
        "errors": {
          "missing_data": "Les informations de la carte sont manquantes. Veuillez réessayer.",
          "load_error": "Échec du chargement de votre carte postale : {error}",
          "general_error": "Erreur : {error}",
          "image_selection": "Erreur lors de la sélection de l'image : {error}",
          "upload_failed": "Échec du téléchargement de l'image. Veuillez réessayer.",
          "upload_error": "Erreur lors du téléchargement de l'image : {error}",
          "design_error": "Erreur lors de l'ajout de l'image au design : {error}"
        },
        "success": {
          "image_added": "Image ajoutée à votre carte"
        },
        "loading": {
          "processing": "Traitement de votre image en cours..."
        },
        "tooltips": {
          "help": "Aide à la conception"
        }
      },
      "card_preview": {
        "title": "Aperçu de la Carte",
        "loading": "Chargement de l'aperçu...",
        "error": {
          "title": "Erreur d'Aperçu",
          "message": "Échec du chargement des données",
          "button": "Réessayer"
        },
        "review_title": "Vérifiez Votre Drop Postal",
        "review_description": "Prévisualisez votre carte et sélectionnez le type de code QR que vous souhaitez utiliser.",
        "qr_code": {
          "section_title": "Choisir le Type de Code QR",
          "types": {
            "static": {
              "name": "QR Statique",
              "description": "Contenu fixe qui ne peut pas être modifié après création",
              "price": 3.99
            },
            "dynamic": {
              "name": "QR Dynamique",
              "description": "Le contenu peut être mis à jour à tout moment",
              "price": 5.99
            }
          },
          "content_preview_title": "Aperçu du Contenu du Code QR",
          "content_types": {
            "image": "Contenu Photo",
            "video": "Contenu Vidéo",
            "audio": "Contenu Audio",
            "default": "Contenu Sélectionné"
          },
          "change_button": "Modifier"
        },
        "information": {
          "title": "Comment les Destinataires Verront Votre Contenu",
          "description": "Le destinataire scannera le code QR avec la caméra de son téléphone pour voir votre contenu numérique. Aucune application spéciale n'est requise pour la visualisation.",
          "dynamic_note": "Avec un code QR dynamique, vous pouvez modifier le contenu à tout moment, même après l'envoi de la carte."
        },
        "buttons": {
          "continue": "CONTINUER VERS LE PAIEMENT",
          "add_content": "AJOUTER D'ABORD DU CONTENU QR",
          "selected": "Sélectionné : "
        }
      },"checkout": {
        "title": "Paiement",
        "coming_soon": {
          "title": "Paiement Bientôt Disponible !",
          "message": "Nous travaillons dur pour vous offrir une expérience de paiement fluide. Restez à l'écoute !",
          "button": "Voir Mes Drops Postaux"
        }
      },"create_postal_drop": {
        "title": "Créer un Drop Postal",
        "header": {
          "title": "Créer une Carte Postale Personnalisée",
          "description": "Concevez une carte postale personnalisée avec vos photos et votre message, puis ajoutez du contenu numérique avec un code QR."
        },
        "card_type": "Sélectionner le Type de Carte",
        "card_details": {
          "dimensions": "Dimensions",
          "paper_type": "Type de Papier"
        },
        "card_types": {
          "standard": {
            "name": "Carte Postale Standard",
            "description": "Carte postale classique avec finition brillante"
          },
          "premium": {
            "name": "Carte Postale Premium",
            "description": "Qualité premium avec finition mate"
          },
          "square": {
            "name": "Carte Postale Carrée",
            "description": "Format carré avec coins arrondis"
          }
        },
        "buttons": {
          "start_designing": "Commencer la Conception"
        },
        "errors": {
          "creation_failed": "Échec de la création du drop postal"
        }
      },
      "my_postal_drops": {
        "title": "Mes Drops Postaux",
        "tabs": {
          "postal_drops": "Drops Postaux",
          "orders": "Commandes"
        },
        "refresh": {
          "success": "Données actualisées avec succès",
          "error": "Échec de l'actualisation : {error}"
        },
        "empty_states": {
          "drops": {
            "title": "Pas encore de drops postaux",
            "message": "Créez votre premier drop postal !"
          },
          "orders": {
            "title": "Pas encore de commandes",
            "message": "Complétez votre drop postal pour passer une commande"
          }
        },
        "section_headers": {
          "drafts": "Brouillons",
          "ordered": "Drops Postaux Commandés"
        },
        "postal_drop_card": {
          "recipient_label": "À",
          "no_recipient": "Aucun destinataire spécifié",
          "created_on": "Créé le {date}",
          "buttons": {
            "delete": "Supprimer",
            "continue_editing": "Continuer l'Édition",
            "view_details": "Voir Détails"
          }
        },
        "order_card": {
          "order_number": "Commande #{id}",
          "shipping": "Expédition : {method}",
          "tracking": "Suivi : {number}",
          "estimated_delivery": "Livraison estimée : {date}",
          "buttons": {
            "complete_payment": "Finaliser le Paiement",
            "view_details": "Voir Détails"
          }
        },
        "delete_dialog": {
          "title": "Supprimer le brouillon ?",
          "message": "Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action ne peut pas être annulée.",
          "cancel": "Annuler",
          "confirm": "Supprimer"
        },
        "notifications": {
          "draft_deleted": "Brouillon supprimé avec succès",
          "delete_error": "Échec de la suppression du brouillon : {error}"
        },
        "status": {
          "draft": "Brouillon",
          "pending_payment": "Paiement en attente",
          "processing": "En traitement",
          "shipped": "Expédié",
          "delivered": "Livré",
          "cancelled": "Annulé"
        },
        "order_status": {
          "created": "En traitement",
          "processing": "En traitement",
          "paid": "Payé",
          "shipped": "Expédié",
          "delivered": "Livré",
          "cancelled": "Annulé",
          "failed": "Échec"
        },
        "create_new": "Créer Nouveau",
        "retry": "Réessayer",
        "error_loading": "Erreur lors du chargement des données"
      },
      "order_confirmation": {
        "title": "Confirmation de Commande",
        "success_header": {
          "title": "Commande Réussie !",
          "subtitle": "Votre commande a été passée"
        },
        "order_details": {
          "title": "Détails de la Commande",
          "order_id": "Numéro de commande",
          "date": "Date",
          "status": "Statut",
          "shipping": "Expédition",
          "tracking_number": "Numéro de suivi",
          "estimated_delivery": "Livraison estimée"
        },
        "next_steps": {
          "title": "Que se passe-t-il ensuite ?",
          "steps": {
            "printing": {
              "number": "1",
              "title": "Impression",
              "description": "Nous imprimerons votre carte postale avec le code QR."
            },
            "shipping": {
              "number": "2",
              "title": "Expédition",
              "description": "Votre carte sera envoyée au destinataire."
            },
            "tracking": {
              "number": "3",
              "title": "Suivi",
              "description": "Vous recevrez des mises à jour sur l'état de votre commande."
            },
            "delivery": {
              "number": "4",
              "title": "Livraison",
              "description": "Le destinataire recevra votre drop postal !"
            }
          }
        },
        "buttons": {
          "view_orders": "VOIR MES COMMANDES",
          "back_home": "RETOUR À L'ACCUEIL",
          "retry": "Réessayer",
          "go_to_orders": "Voir Mes Commandes"
        },
        "errors": {
          "load_error": "Échec du chargement des informations de commande"
        }
      },"order_details": {
        "title": "Détails de la Commande",
        "order_header": {
          "order_number": "Commande #{id}",
          "placed_on": "Passée le {date}"
        },
        "delivery_timeline": {
          "title": "Statut de la Livraison",
          "steps": {
            "order_placed": {
              "title": "Commande Passée",
              "description": "Votre commande a été reçue"
            },
            "processing": {
              "title": "En Traitement",
              "description": "Votre commande est en cours de préparation"
            },
            "shipped": {
              "title": "Expédiée",
              "description": "Votre carte postale est en route"
            },
            "delivered": {
              "title": "Livrée",
              "description": "Livrée au destinataire"
            }
          }
        },
        "tracking": {
          "title": "Informations de Suivi",
          "shipping_method": "Méthode d'Expédition",
          "tracking_number": "Numéro de Suivi : {number}",
          "track_button": "Suivre le Colis",
          "tracking_error": "Impossible d'ouvrir le suivi : {error}"
        },
        "actions": {
          "complete_payment": "FINALISER LE PAIEMENT"
        },
        "error": {
          "title": "Impossible de charger les détails de la commande",
          "message": "Une erreur s'est produite lors du chargement des détails de la commande. Veuillez réessayer.",
          "retry_button": "Réessayer"
        },
        "loading": "Chargement des détails de la commande..."
      },
      "qr_content_selector": {
        "title": "Ajouter du Contenu QR",
        "header": {
          "title": "Ajouter du Contenu au Code QR",
          "description": "Sélectionnez le type de contenu que vous souhaitez ajouter à votre code QR."
        },
        "content_types": {
          "image": {
            "title": "Photo",
            "description": "Ajouter une photo mémorable"
          },
          "video": {
            "title": "Vidéo",
            "description": "Ajouter un court clip vidéo"
          },
          "audio": {
            "title": "Audio",
            "description": "Ajouter un message vocal ou une chanson"
          }
        },
        "file_preview": {
          "title": "Fichier Sélectionné :",
          "image": "Aperçu de l'image",
          "video": "Fichier vidéo sélectionné",
          "audio": "Fichier audio sélectionné"
        },
        "buttons": {
          "select_image": "Sélectionner une Photo",
          "select_video": "Sélectionner une Vidéo",
          "select_audio": "Sélectionner un Audio",
          "select_file": "Sélectionner un Fichier",
          "upload": "TÉLÉCHARGER ET CONTINUER"
        },
        "info_box": {
          "title": "Comment Fonctionnent les Codes QR",
          "description": "Lorsque quelqu'un reçoit votre carte postale, il scannera le code QR avec son téléphone pour voir votre contenu numérique. Assurez-vous que votre contenu est approprié et significatif pour le destinataire.",
          "file_limits": "Limites de taille de fichier : Images (5 Mo), Vidéos (50 Mo), Audio (20 Mo)"
        },
        "errors": {
          "select_file": "Veuillez d'abord sélectionner un fichier",
          "file_selection": "Erreur lors de la sélection du fichier : {error}",
          "create_qr": "Erreur lors de la création du code QR : {error}",
          "postal_drop_not_found": "Drop postal introuvable"
        }
      },
      "qr_scanner": {
        "title": "Scanner le Code QR",
        "instructions": "Pointez votre caméra vers un code QR",
        "permissions": {
          "camera_required": "L'autorisation de la caméra est nécessaire pour scanner les codes QR",
          "camera_denied": "L'accès à la caméra a été refusé. Veuillez l'activer dans les paramètres pour scanner les codes QR",
          "open_settings": "Ouvrir les Paramètres",
          "cancel": "Annuler",
          "grant_access": "Autoriser l'Accès"
        },
        "loading": "Initialisation de la caméra...",
        "error": {
          "title": "Erreur de Scanner",
          "message": "Impossible d'initialiser la caméra : {error}",
          "button": "Réessayer"
        },
        "success": {
          "title": "Code QR Détecté",
          "loading": "Traitement du code QR...",
          "message": "Code QR scanné avec succès",
          "content": "Contenu : {content}"
        },
        "tooltips": {
          "flash": "Activer/désactiver le flash",
          "gallery": "Sélectionner depuis la galerie",
          "close": "Fermer le scanner"
        },
        "no_code_found": "Aucun code QR trouvé dans l'image sélectionnée",
        "gallery_error": "Erreur lors de la sélection de l'image : {error}",
        "processing_error": "Erreur lors du traitement du code QR : {error}"
      },
      "address_form": {
        "labels": {
          "recipient_name": "Nom Complet",
          "sender_name": "Nom Complet",
          "street": "Adresse",
          "city": "Ville",
          "state": "État/Province",
          "postal_code": "Code Postal",
          "country": "Pays"
        },
        "placeholders": {
          "name": "Jean Dupont",
          "street": "123 Rue Principale",
          "city": "Paris",
          "state": "Île-de-France",
          "postal_code": "75001",
          "country": "France"
        },
        "validation": {
          "required": "Ce champ est obligatoire"
        }
      },"validators": {
        "required": "Ce champ est obligatoire",
        "email": "Veuillez entrer une adresse e-mail valide",
        "phone": "Veuillez entrer un numéro de téléphone valide",
        "postal_code": "Veuillez entrer un code postal valide",
        "min_length": "Doit comporter au moins {count} caractères",
        "max_length": "Doit comporter au plus {count} caractères"
      },"card_preview_widget": {
        "no_design": "Aucun design disponible",
        "message_label": "Message",
        "address_labels": {
          "to": "À :",
          "from": "DE :"
        },
        "instructions": {
          "flip_card": "Touchez la carte pour la retourner"
        },
        "sides": {
          "front": "Recto",
          "back": "Verso"
        }
      },
      "empty_states": {
        "try_again": "Réessayer",
        "loading": "Chargement...",
        "error": {
          "title": "Oups ! Quelque chose s'est mal passé",
          "button": "Réessayer"
        },
        "no_items": {
          "button": "Créer",
          "action": "Ajouter"
        }
      },
      "image_editor": {
        "title": "Éditeur d'Image",
        "no_image": "Aucune image sélectionnée",
        "edit_toggle": {
          "open": "Modifier l'Image",
          "close": "Fermer l'Éditeur"
        },
        "tools": {
          "crop": "Recadrer",
          "rotate_left": "Rotation à Gauche",
          "rotate_right": "Rotation à Droite",
          "compress": "Compresser"
        },
        "filters": {
          "title": "Filtres",
          "normal": "Normal",
          "grayscale": "Noir et Blanc",
          "sepia": "Sépia",
          "vintage": "Vintage",
          "cool": "Froid",
          "warm": "Chaud"
        },
        "adjustments": {
          "title": "Réglages",
          "brightness": "Luminosité",
          "contrast": "Contraste",
          "saturation": "Saturation",
          "apply": "Appliquer les Réglages"
        },
        "sources": {
          "gallery": "Galerie",
          "camera": "Caméra"
        },
        "actions": {
          "use_image": "Utiliser cette Image",
          "change_image": "Choisir une Autre Image"
        },
        "processing": "Traitement en cours...",
        "errors": {
          "title": "Erreur",
          "pick_image": "Erreur lors de la sélection de l'image : {error}",
          "crop_image": "Erreur lors du recadrage de l'image : {error}",
          "rotate_image": "Erreur lors de la rotation de l'image : {error}",
          "apply_filter": "Erreur lors de l'application du filtre : {error}",
          "adjust_image": "Erreur lors de l'ajustement de l'image : {error}",
          "compress_image": "Erreur lors de la compression de l'image : {error}"
        }
      },"text_editor": {
        "hint_text": "Entrez du texte ici...",
        "formatting": {
          "show": "Afficher la Mise en Forme",
          "hide": "Masquer la Mise en Forme"
        },
        "tools": {
          "bold": "Gras",
          "italic": "Italique",
          "underline": "Souligné",
          "text_color": "Couleur du Texte"
        },
        "color_picker": {
          "title": "Choisir une couleur",
          "done": "Terminé"
        },
        "font_size": {
          "title": "Taille de Police :"
        }
      },"email_verification": {
        "title": "Vérifiez Votre Email",
        "header": "Email de Vérification Envoyé",
        "email_sent": "Nous avons envoyé un email de vérification à :\n{email}",
        "instructions": "Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification pour compléter votre inscription.",
        "success": "Email vérifié avec succès !",
        "no_email": "Vous n'avez pas reçu l'email ?",
        "resend": "Renvoyer l'Email de Vérification",
        "resend_timer": "Renvoyer dans {seconds} secondes",
        "back_to_login": "Retour à la Connexion",
        "notification": "Email de vérification renvoyé !"
      },"login_screen": {
        "title": "Bon Retour",
        "subtitle": "Connectez-vous pour continuer",
        "methods": {
          "phone": "Téléphone",
          "email": "Email"
        },
        "form": {
          "phone_number": "Numéro de Téléphone",
          "phone_hint": "123456789",
          "email": "Email",
          "email_hint": "votre@email.com",
          "password": "Mot de passe",
          "password_hint": "••••••••",
          "otp_info": "Un code de vérification sera envoyé à ce numéro",
          "remember_me": "Se souvenir de moi",
          "forgot_password": "Mot de passe oublié ?"
        },
        "validation": {
          "phone_required": "Veuillez saisir votre numéro de téléphone",
          "phone_invalid": "Veuillez saisir un numéro de téléphone valide",
          "email_required": "Veuillez saisir votre email",
          "email_invalid": "Veuillez saisir un email valide",
          "password_required": "Veuillez saisir votre mot de passe",
          "password_short": "Le mot de passe doit contenir au moins 6 caractères"
        },
        "buttons": {
          "sign_in": "SE CONNECTER",
          "continue": "CONTINUER",
          "or_continue_with": "OU CONTINUER AVEC",
          "google": "Se connecter avec Google",
          "apple": "Se connecter avec Apple"
        },
        "auth_failed": "Échec d'authentification : {error}",
        "no_account": "Vous n'avez pas de compte ?",
        "sign_up": "S'inscrire"
      },
      "phone_otp_verification": {
        "title": "Vérifiez Votre Numéro",
        "subtitle": "Nous avons envoyé un code de vérification par SMS à",
        "verification_error": "Veuillez saisir les 6 chiffres",
        "verify_button": "VÉRIFIER LE CODE",
        "didnt_receive_code": "Vous n'avez pas reçu le code ?",
        "resend_code": "Renvoyer le Code",
        "resend_timer": "Renvoyer dans {seconds} s",
        "code_resent": "Nouveau code de vérification envoyé !",
        "resend_failed": "Échec du renvoi du code",
        "tip": {
          "title": "Astuce :",
          "message": "Assurez-vous de vérifier vos messages SMS. Si vous ne recevez pas de code dans la minute, essayez de renvoyer ou vérifiez que votre numéro de téléphone est correct."
        }
      },"profile_completion": {
        "title": "Complétez Votre Profil",
        "profile_image": {
          "title": "Photo de Profil (Facultative)",
          "accessibility": {
            "label": "Sélecteur de photo de profil",
            "hint": "Appuyez pour choisir ou prendre une photo de profil"
          },
          "actions": {
            "take_photo": "Prendre une photo",
            "choose_gallery": "Choisir dans la galerie",
            "remove_photo": "Supprimer la photo"
          },
          "notifications": {
            "selected": "Photo de profil sélectionnée",
            "removed": "Photo de profil supprimée",
            "error": "Échec du traitement de l'image : {error}"
          }
        },
        "form": {
          "username": {
            "label": "Nom d'utilisateur *",
            "hint": "Choisissez un nom d'utilisateur unique",
            "helper": "Lettres, chiffres, underscore, point et tiret uniquement"
          },
          "first_name": {
            "label": "Prénom (Facultatif)",
            "hint": "Entrez votre prénom"
          },
          "last_name": {
            "label": "Nom de famille (Facultatif)",
            "hint": "Entrez votre nom de famille"
          }
        },
        "validation": {
          "username_required": "Le nom d'utilisateur est requis",
          "username_min_length": "Le nom d'utilisateur doit comporter au moins {count} caractères",
          "username_max_length": "Le nom d'utilisateur ne peut pas dépasser {count} caractères",
          "username_pattern": "Le nom d'utilisateur peut uniquement contenir des lettres, des chiffres, des underscores, des points et des tirets",
          "first_name_max_length": "Le prénom ne peut pas dépasser {count} caractères",
          "last_name_max_length": "Le nom de famille ne peut pas dépasser {count} caractères"
        },
        "buttons": {
          "complete_profile": "COMPLÉTER LE PROFIL",
          "retry": "RÉESSAYER"
        },
        "notifications": {
          "completion_failed": "Échec de complétion du profil",
          "general_error": "Erreur : {error}"
        }
      },
      "profile_screen": {
        "title": "Profil",
        "profile_settings": "Paramètres du Profil",
        "fields": {
          "username": "Nom d'utilisateur",
          "first_name": "Prénom",
          "last_name": "Nom de famille",
          "email": "Email",
          "phone": "Téléphone"
        },
        "appearance": {
          "dark_mode": "Mode Sombre"
        },
        "tooltips": {
          "update_profile_picture": "Mettre à jour la photo de profil",
          "refresh": "Actualiser le profil"
        },
        "actions": {
          "edit": "Modifier",
          "save": "Enregistrer",
          "cancel": "Annuler",
          "logout": "Se déconnecter",
          "delete_account": "Supprimer le compte"
        },
        "edit_restrictions": {
          "email_edit": "Seuls les emails @drop peuvent être modifiés",
          "phone_edit": "Le téléphone peut uniquement être modifié s'il est vide"
        },
        "delete_account_dialog": {
          "title": "Supprimer le compte",
          "message": "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
          "cancel": "Annuler",
          "confirm": "Supprimer"
        },
        "notifications": {
          "profile_updated": "Profil mis à jour avec succès",
          "update_failed": "Erreur lors de la mise à jour du profil : {error}",
          "refresh_failed": "Erreur lors de l'actualisation du profil : {error}"
        }
      },
      "register_screen": {
        "title": "S'inscrire",
        "header_icon": "Icône d'inscription de compte",
        "validation": {
          "email_required": "Veuillez saisir votre email",
          "email_invalid": "Veuillez saisir un email valide",
          "password_required": "Veuillez saisir un mot de passe",
          "password_short": "Le mot de passe doit contenir au moins 6 caractères",
          "confirm_password_required": "Veuillez confirmer votre mot de passe",
          "passwords_not_match": "Les mots de passe ne correspondent pas"
        },
        "form": {
          "email": {
            "label": "Email",
            "hint": "Entrez votre adresse email"
          },
          "password": {
            "label": "Mot de passe",
            "hint": "Entrez un mot de passe sécurisé"
          },
          "confirm_password": {
            "label": "Confirmer le mot de passe",
            "hint": "Entrez à nouveau le même mot de passe"
          }
        },
        "buttons": {
          "register": "S'INSCRIRE",
          "have_account": "Vous avez déjà un compte ? Connectez-vous"
        }
      }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

export default router;