export enum NotificationEventType {
  CARD_CREATED = "CARD_CREATED",
  CARD_DELETED = "CARD_DELETED",
  CATEGORY_CREATED = "CATEGORY_CREATED",
  BOARD_CREATED = "BOARD_CREATED",
  BOARD_DELETED = "BOARD_DELETED",
  BOARD_UPDATED = "BOARD_UPDATED",
}

export const capitalizeFirstLetter = (str) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const mapEventToMessage = (event, author, details) => {
  const capitalizedAuthor = capitalizeFirstLetter(author)
  const truncatedAuthor =
    capitalizedAuthor.length > 10
      ? `${capitalizedAuthor.substring(0, 10)}...`
      : capitalizedAuthor
  const truncatedDetails =
    details.length > 10 ? `${details.substring(0, 10)}...` : details

  const boldAuthor = `<strong>${truncatedAuthor}</strong>`
  const boldDetails = `<strong>${truncatedDetails}</strong>`

  switch (event) {
    case NotificationEventType.CARD_CREATED:
      return `New Card ${boldDetails} is created by ${boldAuthor}.`
    case NotificationEventType.CARD_DELETED:
      return ` Card ${boldDetails} is deleted by ${boldAuthor}.`
    case NotificationEventType.CATEGORY_CREATED:
      return `New Category ${boldDetails} is created by ${boldAuthor}.`
    case NotificationEventType.BOARD_CREATED:
      return ` New Board ${boldDetails} is created by ${boldAuthor}.`
    case NotificationEventType.BOARD_DELETED:
      return `Board ${boldDetails} is deleted by ${boldAuthor}.`
    case NotificationEventType.BOARD_UPDATED:
      return `Board ${boldDetails} is updated by ${boldAuthor}.`
    default:
      return ""
  }
}
