package com.pledge.backend.serviceimpl;

import com.pledge.backend.entity.PledgeEntity;
import com.pledge.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

	@Value("${app.mail.enabled:true}")
	private boolean mailEnabled;

	@Value("${app.mail.to:godejewellers023@gmail.com}")
	private String defaultToEmail;

    public EmailServiceImpl(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

	@Override
	public void sendPledgePhotosEmail(PledgeEntity pledge, String toEmailAddress) {
		if (!mailEnabled) {
			System.out.println("Mail disabled; skipping send for pledge " + pledge.getId());
			return;
		}
        try {
            if (this.mailSender == null) {
                System.out.println("No JavaMailSender configured; skipping email for pledge " + pledge.getId());
                return;
            }
			String to = StringUtils.hasText(toEmailAddress) ? toEmailAddress : defaultToEmail;
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			helper.setTo(to);
			helper.setSubject("Pledge " + pledge.getId() + " photos and details");
			StringBuilder body = new StringBuilder();
			body.append("Pledge ID: ").append(pledge.getId()).append("\n");
			body.append("Customer ID: ").append(pledge.getCustomerId()).append("\n");
			body.append("Amount (current principal): ").append(pledge.getAmount()).append("\n");
			body.append("Interest Rate (monthly %): ").append(pledge.getInterestRate()).append("\n\n");
			if (StringUtils.hasText(pledge.getCustomerPhoto())) body.append("Customer Photo: ").append(pledge.getCustomerPhoto()).append("\n");
			if (StringUtils.hasText(pledge.getItemPhoto())) body.append("Item Photo: ").append(pledge.getItemPhoto()).append("\n");
			if (StringUtils.hasText(pledge.getReceiptPhoto())) body.append("Receipt Photo: ").append(pledge.getReceiptPhoto()).append("\n");
			helper.setText(body.toString());

			// Try attaching images by downloading URLs if accessible
			RestTemplate rt = new RestTemplate();
			tryAttach(rt, helper, pledge.getCustomerPhoto(), "customer-photo");
			tryAttach(rt, helper, pledge.getItemPhoto(), "item-photo");
			tryAttach(rt, helper, pledge.getReceiptPhoto(), "receipt-photo");

			mailSender.send(message);
			System.out.println("Mail sent for pledge " + pledge.getId() + " to " + to);
		} catch (Exception ex) {
			System.err.println("Failed to send mail for pledge " + pledge.getId() + ": " + ex.getMessage());
		}
	}

	private void tryAttach(RestTemplate rt, MimeMessageHelper helper, String url, String namePrefix) {
		if (!StringUtils.hasText(url)) return;
		try {
			ResponseEntity<byte[]> resp = rt.getForEntity(url, byte[].class);
			if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
				ByteArrayResource res = new ByteArrayResource(resp.getBody());
				helper.addAttachment(namePrefix + ".jpg", res);
			}
		} catch (Exception ignored) { }
	}
}


